import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  colorFormulas,
  factorySettings,
  formulaItems,
  formulaVariants,
  productionOrders,
  rawMaterials,
} from "@db/schema";
import { getOrCreateSettings } from "./productionCore";

export const settingsRouter = createRouter({
  get: authedQuery.query(({ ctx }) => getOrCreateSettings(ctx.user.id)),

  update: authedQuery
    .input(
      z.object({
        fixedCostPerKg: z.number().min(0, "Fixed cost cannot be negative"),
        profitPercent: z
          .number()
          .min(0, "Profit margin cannot be negative")
          .max(1000, "Profit margin looks unrealistic"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await getOrCreateSettings(ctx.user.id);
      await db
        .update(factorySettings)
        .set(input)
        .where(eq(factorySettings.userId, ctx.user.id));
      return db.query.factorySettings.findFirst({
        where: eq(factorySettings.userId, ctx.user.id),
      });
    }),

  /** Everything the user owns, as one JSON payload (downloaded client-side). */
  exportAll: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const [materials, settings, orders, formulas] = await Promise.all([
      db.select().from(rawMaterials).where(eq(rawMaterials.userId, userId)),
      db.query.factorySettings.findFirst({ where: eq(factorySettings.userId, userId) }),
      db.select().from(productionOrders).where(eq(productionOrders.userId, userId)),
      db.query.colorFormulas.findMany({
        where: eq(colorFormulas.userId, userId),
        with: { variants: { with: { items: true } } },
      }),
    ]);
    return {
      exportedAt: new Date(),
      account: { name: ctx.user.name, email: ctx.user.email },
      settings,
      rawMaterials: materials,
      colorFormulas: formulas,
      productionOrders: orders,
    };
  }),

  /** Insert sample raw materials + formulas for a brand-new account. */
  seedDemo: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const existing = await db
      .select({ id: rawMaterials.id })
      .from(rawMaterials)
      .where(eq(rawMaterials.userId, userId))
      .limit(1);
    if (existing.length > 0) {
      return { seeded: false };
    }

    const demoMaterials = [
      { name: "PP Granules (White Base)", unit: "kg" as const, quantity: 250, pricePerUnit: 92 },
      { name: "HDPE Granules (Natural)", unit: "kg" as const, quantity: 180, pricePerUnit: 88 },
      { name: "Masterbatch — Ruby Red", unit: "kg" as const, quantity: 24, pricePerUnit: 320 },
      { name: "Masterbatch — Ocean Blue", unit: "kg" as const, quantity: 18, pricePerUnit: 340 },
      { name: "Masterbatch — Sun Gold", unit: "kg" as const, quantity: 12, pricePerUnit: 355 },
      { name: "UV Stabilizer", unit: "g" as const, quantity: 5000, pricePerUnit: 1.2 },
      { name: "Gloss Additive", unit: "ml" as const, quantity: 8000, pricePerUnit: 0.6 },
    ];

    const insertedIds: number[] = [];
    for (const m of demoMaterials) {
      const [{ id }] = await db.insert(rawMaterials).values({ ...m, userId }).returning({
        id: rawMaterials.id,
      });
      insertedIds.push(id);
    }
    const [pp, hdpe, red, blue, gold, uv, gloss] = insertedIds;

    const demoFormulas: Array<{
      colorName: string;
      variants: Array<{ variantName: string; items: Array<{ materialId: number; quantity: number }> }>;
    }> = [
      {
        colorName: "Ruby Red",
        variants: [
          {
            variantName: "Standard",
            items: [
              { materialId: pp, quantity: 10 },
              { materialId: red, quantity: 1 },
              { materialId: uv, quantity: 0.05 },
            ],
          },
          {
            variantName: "Premium",
            items: [
              { materialId: hdpe, quantity: 10 },
              { materialId: red, quantity: 1.4 },
              { materialId: uv, quantity: 0.08 },
              { materialId: gloss, quantity: 0.12 },
            ],
          },
        ],
      },
      {
        colorName: "Ocean Blue",
        variants: [
          {
            variantName: "Standard",
            items: [
              { materialId: pp, quantity: 10 },
              { materialId: blue, quantity: 1.1 },
              { materialId: uv, quantity: 0.05 },
            ],
          },
        ],
      },
      {
        colorName: "Sun Gold",
        variants: [
          {
            variantName: "Economy",
            items: [
              { materialId: hdpe, quantity: 12 },
              { materialId: gold, quantity: 0.8 },
            ],
          },
        ],
      },
    ];

    for (const f of demoFormulas) {
      const [{ id: formulaId }] = await db
        .insert(colorFormulas)
        .values({ userId, colorName: f.colorName })
        .returning({ id: colorFormulas.id });
      for (const v of f.variants) {
        const [{ id: variantId }] = await db
          .insert(formulaVariants)
          .values({ formulaId, variantName: v.variantName })
          .returning({ id: formulaVariants.id });
        await db
          .insert(formulaItems)
          .values(v.items.map((i) => ({ variantId, ...i })));
      }
    }

    await db
      .insert(factorySettings)
      .values({ userId, fixedCostPerKg: 15, profitPercent: 22 })
      .onConflictDoUpdate({
        target: factorySettings.userId,
        set: { userId },
      });

    return { seeded: true };
  }),
});
