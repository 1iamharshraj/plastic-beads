import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import {
  colorFormulas,
  factorySettings,
  formulaItems,
  formulaVariants,
  rawMaterials,
} from "@db/schema";

/**
 * First-run demo content: if a user has no materials and no formulas yet,
 * stock their factory with sample raw materials and a couple of color
 * formulas so every screen has something real to show. Runs at most once
 * per user (any material or formula row marks the account as seeded).
 */
export async function seedDemoDataIfEmpty(userId: number): Promise<void> {
  const db = getDb();

  const [existingMaterial, existingFormula] = await Promise.all([
    db.query.rawMaterials.findFirst({ where: eq(rawMaterials.userId, userId) }),
    db.query.colorFormulas.findFirst({ where: eq(colorFormulas.userId, userId) }),
  ]);
  if (existingMaterial || existingFormula) return;

  /* default factory settings */
  await db
    .insert(factorySettings)
    .values({ userId, fixedCostPerKg: 45, profitPercent: 20 })
    .onConflictDoUpdate({
      target: factorySettings.userId,
      set: { userId },
    });

  /* sample raw materials (inserted one-by-one so returned ids are deterministic) */
  const materialRows = [
    { name: "PET Base Resin", unit: "kg" as const, quantity: 120, pricePerUnit: 92.5 },
    { userId, name: "PP Granules", unit: "kg" as const, quantity: 85, pricePerUnit: 78 },
    { userId, name: "Amber Masterbatch", unit: "kg" as const, quantity: 6.5, pricePerUnit: 340 },
    { userId, name: "Ocean Teal Pigment", unit: "kg" as const, quantity: 2.2, pricePerUnit: 560 },
    { userId, name: "Ivory White Pigment", unit: "kg" as const, quantity: 4, pricePerUnit: 410 },
    { userId, name: "UV Stabilizer", unit: "litre" as const, quantity: 12, pricePerUnit: 690 },
    { userId, name: "Mold Release Agent", unit: "litre" as const, quantity: 5, pricePerUnit: 380 },
  ];

  const materialIds: number[] = [];
  for (const m of materialRows) {
    const [{ id }] = await db.insert(rawMaterials).values({ ...m, userId }).returning({
      id: rawMaterials.id,
    });
    materialIds.push(id);
  }
  const [pet, pp, amber, teal, ivory, uv] = materialIds;

  /* sample color formulas with variants */
  const [{ id: caId }] = await db
    .insert(colorFormulas)
    .values({ userId, colorName: "Candy Amber" })
    .returning({ id: colorFormulas.id });

  const [{ id: caStdId }] = await db
    .insert(formulaVariants)
    .values({ formulaId: caId, variantName: "Standard" })
    .returning({ id: formulaVariants.id });
  await db.insert(formulaItems).values([
    { variantId: caStdId, materialId: pet, quantity: 10 },
    { variantId: caStdId, materialId: amber, quantity: 0.25 },
    { variantId: caStdId, materialId: ivory, quantity: 0.1 },
  ]);

  const [{ id: caPremId }] = await db
    .insert(formulaVariants)
    .values({ formulaId: caId, variantName: "Premium" })
    .returning({ id: formulaVariants.id });
  await db.insert(formulaItems).values([
    { variantId: caPremId, materialId: pp, quantity: 8 },
    { variantId: caPremId, materialId: amber, quantity: 0.4 },
    { variantId: caPremId, materialId: uv, quantity: 0.05 },
  ]);

  const [{ id: otId }] = await db
    .insert(colorFormulas)
    .values({ userId, colorName: "Deep Ocean Teal" })
    .returning({ id: colorFormulas.id });

  const [{ id: otStdId }] = await db
    .insert(formulaVariants)
    .values({ formulaId: otId, variantName: "Standard" })
    .returning({ id: formulaVariants.id });
  await db.insert(formulaItems).values([
    { variantId: otStdId, materialId: pet, quantity: 9 },
    { variantId: otStdId, materialId: teal, quantity: 0.3 },
    { variantId: otStdId, materialId: ivory, quantity: 0.15 },
  ]);
}
