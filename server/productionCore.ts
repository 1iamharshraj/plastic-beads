import { and, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import {
  factorySettings,
  formulaVariants,
  rawMaterials,
  type MaterialUnit,
  type ProductionBreakdownRow,
  type ShortageDetail,
} from "@db/schema";

export const r2 = (n: number) => Math.round(n * 100) / 100;

export interface ProductionAnalysis {
  variantId: number;
  colorName: string;
  variantName: string;
  requiredQty: number;
  feasible: boolean;
  shortages: ShortageDetail[];
  breakdown: ProductionBreakdownRow[];
  materialCost: number;
  fixedCost: number;
  totalCost: number;
  profitPercent: number;
  profitAmount: number;
  customerPrice: number;
}

export async function getOrCreateSettings(userId: number) {
  const db = getDb();
  const existing = await db.query.factorySettings.findFirst({
    where: eq(factorySettings.userId, userId),
  });
  if (existing) return existing;
  await db
    .insert(factorySettings)
    .values({ userId, fixedCostPerKg: 0, profitPercent: 0 })
    .onConflictDoUpdate({
      target: factorySettings.userId,
      set: { userId },
    });
  const created = await db.query.factorySettings.findFirst({
    where: eq(factorySettings.userId, userId),
  });
  return created!;
}

/**
 * Feasibility + costing, per the factory rules:
 *   scaleFactor = requiredQty / sumOfAllRatiosInFormula
 *   neededQty   = ratio × scaleFactor
 *   materialCost = Σ(neededQty × pricePerUnit)
 *   fixedCost    = requiredQty × fixedCostPerKg
 *   customerPrice = totalCost × (1 + profitPercent/100)
 */
export async function analyzeProduction(
  userId: number,
  variantId: number,
  requiredQty: number,
): Promise<ProductionAnalysis> {
  const db = getDb();

  const variant = await db.query.formulaVariants.findFirst({
    where: eq(formulaVariants.id, variantId),
    with: { formula: true, items: true },
  });
  if (!variant || variant.formula.userId !== userId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Formula variant not found" });
  }
  if (variant.items.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This variant has no materials — add at least one to run an analysis.",
    });
  }
  const ratioSum = variant.items.reduce((s, i) => s + i.quantity, 0);
  if (ratioSum <= 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Formula ratios sum to zero." });
  }

  const materialIds = [...new Set(variant.items.map((i) => i.materialId))];
  const mats = await db
    .select()
    .from(rawMaterials)
    .where(and(inArray(rawMaterials.id, materialIds), eq(rawMaterials.userId, userId)));
  const byId = new Map(mats.map((m) => [m.id, m]));

  const scaleFactor = requiredQty / ratioSum;
  const breakdown: ProductionBreakdownRow[] = variant.items.map((item) => {
    const mat = byId.get(item.materialId);
    const needed = item.quantity * scaleFactor;
    const available = mat?.quantity ?? 0;
    return {
      materialId: item.materialId,
      materialName: mat?.name ?? "(deleted material)",
      unit: (mat?.unit ?? "kg") as MaterialUnit,
      needed: r2(needed),
      available,
      sufficient: available >= needed,
      cost: r2(needed * (mat?.pricePerUnit ?? 0)),
    };
  });

  const feasible = breakdown.every((b) => b.sufficient);
  const shortages: ShortageDetail[] = breakdown
    .filter((b) => !b.sufficient)
    .map((b) => ({
      materialId: b.materialId,
      materialName: b.materialName,
      unit: b.unit,
      needed: b.needed,
      available: b.available,
      shortBy: r2(b.needed - b.available),
    }));

  const settings = await getOrCreateSettings(userId);
  const materialCost = r2(breakdown.reduce((s, b) => s + b.cost, 0));
  const fixedCost = r2(requiredQty * settings.fixedCostPerKg);
  const totalCost = r2(materialCost + fixedCost);
  const profitAmount = r2((totalCost * settings.profitPercent) / 100);
  const customerPrice = r2(totalCost + profitAmount);

  return {
    variantId,
    colorName: variant.formula.colorName,
    variantName: variant.variantName,
    requiredQty,
    feasible,
    shortages,
    breakdown,
    materialCost,
    fixedCost,
    totalCost,
    profitPercent: settings.profitPercent,
    profitAmount,
    customerPrice,
  };
}
