import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
  bigint,
  decimal,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { MATERIAL_UNITS, type MaterialUnit } from "@contracts/constants";

export { MATERIAL_UNITS, type MaterialUnit };

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const unitEnum = pgEnum("unit", MATERIAL_UNITS);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ---------------- BeadFactory Pro ---------------- */

export const rawMaterials = pgTable(
  "raw_materials",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    unit: unitEnum("unit").notNull(),
    quantity: decimal("quantity", { precision: 14, scale: 4, mode: "number" })
      .notNull()
      .default(0),
    pricePerUnit: decimal("pricePerUnit", { precision: 14, scale: 4, mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("rm_user_idx").on(t.userId)],
);

export type RawMaterial = typeof rawMaterials.$inferSelect;

export const colorFormulas = pgTable(
  "color_formulas",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    colorName: varchar("colorName", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("cf_user_idx").on(t.userId)],
);

export type ColorFormula = typeof colorFormulas.$inferSelect;

export const formulaVariants = pgTable(
  "formula_variants",
  {
    id: serial("id").primaryKey(),
    formulaId: bigint("formulaId", { mode: "number" }).notNull(),
    variantName: varchar("variantName", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("fv_formula_idx").on(t.formulaId)],
);

export type FormulaVariant = typeof formulaVariants.$inferSelect;

export const formulaItems = pgTable(
  "formula_items",
  {
    id: serial("id").primaryKey(),
    variantId: bigint("variantId", { mode: "number" }).notNull(),
    materialId: bigint("materialId", { mode: "number" }).notNull(),
    /** ratio per batch */
    quantity: decimal("quantity", { precision: 14, scale: 4, mode: "number" }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [index("fi_variant_idx").on(t.variantId)],
);

export type FormulaItem = typeof formulaItems.$inferSelect;

export interface ShortageDetail {
  materialId: number;
  materialName: string;
  unit: MaterialUnit;
  needed: number;
  available: number;
  shortBy: number;
}

export const productionOrders = pgTable(
  "production_orders",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    variantId: bigint("variantId", { mode: "number" }).notNull(),
    /** snapshot fields so history survives formula edits */
    colorName: varchar("colorName", { length: 255 }).notNull(),
    variantName: varchar("variantName", { length: 255 }).notNull(),
    requiredQty: decimal("requiredQty", { precision: 14, scale: 4, mode: "number" }).notNull(),
    materialCost: decimal("materialCost", { precision: 14, scale: 2, mode: "number" }).notNull(),
    fixedCost: decimal("fixedCost", { precision: 14, scale: 2, mode: "number" }).notNull(),
    totalCost: decimal("totalCost", { precision: 14, scale: 2, mode: "number" }).notNull(),
    profitPercent: decimal("profitPercent", { precision: 7, scale: 2, mode: "number" }).notNull(),
    customerPrice: decimal("customerPrice", { precision: 14, scale: 2, mode: "number" }).notNull(),
    feasible: boolean("feasible").notNull(),
    shortageDetails: json("shortageDetails").$type<ShortageDetail[]>(),
    breakdown: json("breakdown").$type<ProductionBreakdownRow[]>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [index("po_user_idx").on(t.userId)],
);

export interface ProductionBreakdownRow {
  materialId: number;
  materialName: string;
  unit: MaterialUnit;
  needed: number;
  available: number;
  sufficient: boolean;
  cost: number;
}

export type ProductionOrder = typeof productionOrders.$inferSelect;

export const factorySettings = pgTable(
  "factory_settings",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    fixedCostPerKg: decimal("fixedCostPerKg", { precision: 14, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    profitPercent: decimal("profitPercent", { precision: 7, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("fs_user_unique").on(t.userId)],
);

export type FactorySettings = typeof factorySettings.$inferSelect;
