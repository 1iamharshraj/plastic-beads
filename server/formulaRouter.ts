import { z } from "zod";
import { and, asc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  colorFormulas,
  formulaItems,
  formulaVariants,
  rawMaterials,
} from "@db/schema";

const itemInput = z.object({
  materialId: z.number().int().positive(),
  quantity: z.number().positive("Ratio must be greater than 0"),
});

const variantInput = z.object({
  variantName: z.string().trim().min(1, "Variant name is required").max(255),
  items: z.array(itemInput).min(1, "Add at least one material"),
});

/** Verify every materialId belongs to the user. */
async function assertMaterialsOwned(userId: number, items: z.infer<typeof itemInput>[]) {
  const ids = [...new Set(items.map((i) => i.materialId))];
  const owned = await getDb()
    .select({ id: rawMaterials.id })
    .from(rawMaterials)
    .where(and(inArray(rawMaterials.id, ids), eq(rawMaterials.userId, userId)));
  if (owned.length !== ids.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown material in formula" });
  }
}

async function getOwnedVariant(userId: number, variantId: number) {
  const variant = await getDb().query.formulaVariants.findFirst({
    where: eq(formulaVariants.id, variantId),
    with: { formula: true },
  });
  if (!variant || variant.formula.userId !== userId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Formula variant not found" });
  }
  return variant;
}

export const formulaRouter = createRouter({
  /** All of the user's colors, each with variants and material breakdown. */
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const formulas = await db.query.colorFormulas.findMany({
      where: eq(colorFormulas.userId, ctx.user.id),
      orderBy: asc(colorFormulas.colorName),
      with: {
        variants: {
          orderBy: asc(formulaVariants.variantName),
          with: { items: { with: { material: true } } },
        },
      },
    });
    return formulas;
  }),

  /** Create a color + first variant, or append a variant to an existing color. */
  create: authedQuery
    .input(
      z
        .object({
          formulaId: z.number().int().positive().optional(),
          colorName: z.string().trim().min(1).max(255).optional(),
        })
        .and(variantInput),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await assertMaterialsOwned(ctx.user.id, input.items);

      let formulaId = input.formulaId;
      if (formulaId) {
        const formula = await db.query.colorFormulas.findFirst({
          where: and(eq(colorFormulas.id, formulaId), eq(colorFormulas.userId, ctx.user.id)),
        });
        if (!formula) throw new TRPCError({ code: "NOT_FOUND", message: "Color formula not found" });
      } else {
        if (!input.colorName) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Color name is required" });
        }
        const [{ id }] = await db
          .insert(colorFormulas)
          .values({ userId: ctx.user.id, colorName: input.colorName })
          .returning({ id: colorFormulas.id });
        formulaId = id;
      }

      const [{ id: variantId }] = await db
        .insert(formulaVariants)
        .values({ formulaId, variantName: input.variantName })
        .returning({ id: formulaVariants.id });
      await db.insert(formulaItems).values(
        input.items.map((i) => ({
          variantId,
          materialId: i.materialId,
          quantity: i.quantity,
        })),
      );
      return { formulaId, variantId };
    }),

  /** Replace a variant's name and material list. */
  updateVariant: authedQuery
    .input(z.object({ variantId: z.number().int().positive() }).and(variantInput))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await getOwnedVariant(ctx.user.id, input.variantId);
      await assertMaterialsOwned(ctx.user.id, input.items);
      await db.transaction(async (tx) => {
        await tx
          .update(formulaVariants)
          .set({ variantName: input.variantName })
          .where(eq(formulaVariants.id, input.variantId));
        await tx.delete(formulaItems).where(eq(formulaItems.variantId, input.variantId));
        await tx.insert(formulaItems).values(
          input.items.map((i) => ({
            variantId: input.variantId,
            materialId: i.materialId,
            quantity: i.quantity,
          })),
        );
      });
      return { success: true };
    }),

  renameColor: authedQuery
    .input(
      z.object({
        formulaId: z.number().int().positive(),
        colorName: z.string().trim().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const formula = await db.query.colorFormulas.findFirst({
        where: and(eq(colorFormulas.id, input.formulaId), eq(colorFormulas.userId, ctx.user.id)),
      });
      if (!formula) throw new TRPCError({ code: "NOT_FOUND", message: "Color formula not found" });
      await db
        .update(colorFormulas)
        .set({ colorName: input.colorName })
        .where(eq(colorFormulas.id, input.formulaId));
      return { success: true };
    }),

  deleteVariant: authedQuery
    .input(z.object({ variantId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const variant = await getOwnedVariant(ctx.user.id, input.variantId);
      await db.transaction(async (tx) => {
        await tx.delete(formulaItems).where(eq(formulaItems.variantId, input.variantId));
        await tx.delete(formulaVariants).where(eq(formulaVariants.id, input.variantId));
        /* if the color has no variants left, remove the empty color too */
        const remaining = await tx
          .select({ id: formulaVariants.id })
          .from(formulaVariants)
          .where(eq(formulaVariants.formulaId, variant.formulaId))
          .limit(1);
        if (remaining.length === 0) {
          await tx.delete(colorFormulas).where(eq(colorFormulas.id, variant.formulaId));
        }
      });
      return { success: true };
    }),

  deleteFormula: authedQuery
    .input(z.object({ formulaId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const formula = await db.query.colorFormulas.findFirst({
        where: and(eq(colorFormulas.id, input.formulaId), eq(colorFormulas.userId, ctx.user.id)),
        with: { variants: true },
      });
      if (!formula) throw new TRPCError({ code: "NOT_FOUND", message: "Color formula not found" });
      const variantIds = formula.variants.map((v) => v.id);
      await db.transaction(async (tx) => {
        if (variantIds.length > 0) {
          await tx.delete(formulaItems).where(inArray(formulaItems.variantId, variantIds));
          await tx.delete(formulaVariants).where(inArray(formulaVariants.id, variantIds));
        }
        await tx.delete(colorFormulas).where(eq(colorFormulas.id, input.formulaId));
      });
      return { success: true };
    }),
});
