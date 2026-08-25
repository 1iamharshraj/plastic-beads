import { relations } from "drizzle-orm";
import {
  users,
  rawMaterials,
  colorFormulas,
  formulaVariants,
  formulaItems,
  productionOrders,
  factorySettings,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  rawMaterials: many(rawMaterials),
  colorFormulas: many(colorFormulas),
  productionOrders: many(productionOrders),
  settings: one(factorySettings, {
    fields: [users.id],
    references: [factorySettings.userId],
  }),
}));

export const rawMaterialsRelations = relations(rawMaterials, ({ one, many }) => ({
  user: one(users, { fields: [rawMaterials.userId], references: [users.id] }),
  formulaItems: many(formulaItems),
}));

export const colorFormulasRelations = relations(colorFormulas, ({ one, many }) => ({
  user: one(users, { fields: [colorFormulas.userId], references: [users.id] }),
  variants: many(formulaVariants),
}));

export const formulaVariantsRelations = relations(formulaVariants, ({ one, many }) => ({
  formula: one(colorFormulas, {
    fields: [formulaVariants.formulaId],
    references: [colorFormulas.id],
  }),
  items: many(formulaItems),
  productions: many(productionOrders),
}));

export const formulaItemsRelations = relations(formulaItems, ({ one }) => ({
  variant: one(formulaVariants, {
    fields: [formulaItems.variantId],
    references: [formulaVariants.id],
  }),
  material: one(rawMaterials, {
    fields: [formulaItems.materialId],
    references: [rawMaterials.id],
  }),
}));

export const productionOrdersRelations = relations(productionOrders, ({ one }) => ({
  user: one(users, { fields: [productionOrders.userId], references: [users.id] }),
  variant: one(formulaVariants, {
    fields: [productionOrders.variantId],
    references: [formulaVariants.id],
  }),
}));

export const factorySettingsRelations = relations(factorySettings, ({ one }) => ({
  user: one(users, { fields: [factorySettings.userId], references: [users.id] }),
}));
