CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('kg', 'g', 'litre', 'ml');--> statement-breakpoint
CREATE TABLE "color_formulas" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"colorName" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"fixedCostPerKg" numeric(14, 2) DEFAULT 0 NOT NULL,
	"profitPercent" numeric(7, 2) DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"variantId" bigint NOT NULL,
	"materialId" bigint NOT NULL,
	"quantity" numeric(14, 4) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"formulaId" bigint NOT NULL,
	"variantName" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"variantId" bigint NOT NULL,
	"colorName" varchar(255) NOT NULL,
	"variantName" varchar(255) NOT NULL,
	"requiredQty" numeric(14, 4) NOT NULL,
	"materialCost" numeric(14, 2) NOT NULL,
	"fixedCost" numeric(14, 2) NOT NULL,
	"totalCost" numeric(14, 2) NOT NULL,
	"profitPercent" numeric(7, 2) NOT NULL,
	"customerPrice" numeric(14, 2) NOT NULL,
	"feasible" boolean NOT NULL,
	"shortageDetails" json,
	"breakdown" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit" "unit" NOT NULL,
	"quantity" numeric(14, 4) DEFAULT 0 NOT NULL,
	"pricePerUnit" numeric(14, 4) DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"passwordHash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "cf_user_idx" ON "color_formulas" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "fs_user_unique" ON "factory_settings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "fi_variant_idx" ON "formula_items" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "fv_formula_idx" ON "formula_variants" USING btree ("formulaId");--> statement-breakpoint
CREATE INDEX "po_user_idx" ON "production_orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "rm_user_idx" ON "raw_materials" USING btree ("userId");