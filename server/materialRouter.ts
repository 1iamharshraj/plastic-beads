import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  colorFormulas,
  formulaItems,
  formulaVariants,
  rawMaterials,
  MATERIAL_UNITS,
} from "@db/schema";

const materialInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  unit: z.enum(MATERIAL_UNITS),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  pricePerUnit: z.number().min(0, "Price cannot be negative"),
});

export const materialRouter = createRouter({
  list: authedQuery.query(({ ctx }) =>
    getDb()
      .select()
      .from(rawMaterials)
      .where(eq(rawMaterials.userId, ctx.user.id))
      .orderBy(asc(rawMaterials.name)),
  ),

  create: authedQuery.input(materialInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [{ id }] = await db
      .insert(rawMaterials)
      .values({ ...input, userId: ctx.user.id })
      .returning({ id: rawMaterials.id });
    return db.query.rawMaterials.findFirst({ where: eq(rawMaterials.id, id) });
  }),

  update: authedQuery
    .input(z.object({ id: z.number().int().positive(), data: materialInput }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.rawMaterials.findFirst({
        where: and(eq(rawMaterials.id, input.id), eq(rawMaterials.userId, ctx.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Material not found" });
      await db.update(rawMaterials).set(input.data).where(eq(rawMaterials.id, input.id));
      return db.query.rawMaterials.findFirst({ where: eq(rawMaterials.id, input.id) });
    }),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.rawMaterials.findFirst({
        where: and(eq(rawMaterials.id, input.id), eq(rawMaterials.userId, ctx.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Material not found" });
      const usedIn = await db
        .select({ id: formulaItems.id })
        .from(formulaItems)
        .innerJoin(formulaVariants, eq(formulaItems.variantId, formulaVariants.id))
        .innerJoin(colorFormulas, eq(formulaVariants.formulaId, colorFormulas.id))
        .where(and(eq(formulaItems.materialId, input.id), eq(colorFormulas.userId, ctx.user.id)))
        .limit(1);
      if (usedIn.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Material is used in a formula variant — remove it from the formula first.",
        });
      }
      await db.delete(rawMaterials).where(eq(rawMaterials.id, input.id));
      return { success: true };
    }),
});
