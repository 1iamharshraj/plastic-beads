import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { productionOrders } from "@db/schema";
import { analyzeProduction } from "./productionCore";

const checkInput = z.object({
  variantId: z.number().int().positive(),
  requiredQty: z.number().positive("Required quantity must be greater than 0"),
});

export const productionRouter = createRouter({
  /** Feasibility + cost analysis. Does NOT save anything. */
  check: authedQuery.input(checkInput).mutation(({ ctx, input }) =>
    analyzeProduction(ctx.user.id, input.variantId, input.requiredQty),
  ),

  /** Re-run the analysis and persist it as a production order. */
  save: authedQuery.input(checkInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const a = await analyzeProduction(ctx.user.id, input.variantId, input.requiredQty);
    const [{ id }] = await db
      .insert(productionOrders)
      .values({
        userId: ctx.user.id,
        variantId: a.variantId,
        colorName: a.colorName,
        variantName: a.variantName,
        requiredQty: a.requiredQty,
        materialCost: a.materialCost,
        fixedCost: a.fixedCost,
        totalCost: a.totalCost,
        profitPercent: a.profitPercent,
        customerPrice: a.customerPrice,
        feasible: a.feasible,
        shortageDetails: a.shortages,
        breakdown: a.breakdown,
      })
      .returning({ id: productionOrders.id });
    return db.query.productionOrders.findFirst({ where: eq(productionOrders.id, id) });
  }),

  list: authedQuery.query(({ ctx }) =>
    getDb()
      .select()
      .from(productionOrders)
      .where(eq(productionOrders.userId, ctx.user.id))
      .orderBy(desc(productionOrders.createdAt)),
  ),

  byId: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const order = await getDb().query.productionOrders.findFirst({
        where: and(eq(productionOrders.id, input.id), eq(productionOrders.userId, ctx.user.id)),
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      return order;
    }),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.productionOrders.findFirst({
        where: and(eq(productionOrders.id, input.id), eq(productionOrders.userId, ctx.user.id)),
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      await db.delete(productionOrders).where(eq(productionOrders.id, input.id));
      return { success: true };
    }),
});
