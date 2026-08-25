import { desc, eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  colorFormulas,
  formulaVariants,
  productionOrders,
  rawMaterials,
} from "@db/schema";
import { seedDemoDataIfEmpty } from "./seedDemo";

export const dashboardRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    await seedDemoDataIfEmpty(userId);
    const [materials, formulas, variants, recentOrders] = await Promise.all([
      db
        .select({ id: rawMaterials.id, quantity: rawMaterials.quantity, pricePerUnit: rawMaterials.pricePerUnit })
        .from(rawMaterials)
        .where(eq(rawMaterials.userId, userId)),
      db.select({ id: colorFormulas.id }).from(colorFormulas).where(eq(colorFormulas.userId, userId)),
      db
        .select({ id: formulaVariants.id })
        .from(formulaVariants)
        .innerJoin(colorFormulas, eq(formulaVariants.formulaId, colorFormulas.id))
        .where(eq(colorFormulas.userId, userId)),
      db
        .select()
        .from(productionOrders)
        .where(eq(productionOrders.userId, userId))
        .orderBy(desc(productionOrders.createdAt))
        .limit(5),
    ]);
    const stockValue = materials.reduce((s, m) => s + m.quantity * m.pricePerUnit, 0);
    return {
      materialCount: materials.length,
      formulaCount: formulas.length,
      variantCount: variants.length,
      stockValue: Math.round(stockValue * 100) / 100,
      recentOrders,
    };
  }),
});
