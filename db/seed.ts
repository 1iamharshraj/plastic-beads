import { getDb } from "../server/queries/connection";
import { users } from "./schema";
import { seedDemoDataIfEmpty } from "../server/seedDemo";
import { eq } from "drizzle-orm";

/**
 * Seeds demo raw materials, color formulas and factory settings for the
 * owner account (OWNER_EMAIL) if that user exists and has no data yet.
 * New accounts are seeded automatically on first dashboard visit instead
 * (see server/seedDemo.ts), so this script is a convenience for local testing.
 */
async function seed() {
  const db = getDb();
  const ownerEmail = process.env.OWNER_EMAIL;
  console.log("Seeding database...");

  if (!ownerEmail) {
    console.log("No OWNER_EMAIL set — nothing to seed. New users are auto-seeded on first login.");
    process.exit(0);
  }

  const owner = await db.query.users.findFirst({ where: eq(users.email, ownerEmail.toLowerCase()) });
  if (!owner) {
    console.log("Owner user not found — sign in once, then re-run this script.");
    process.exit(0);
  }

  await seedDemoDataIfEmpty(owner.id);
  console.log("Done.");
  process.exit(0); // close PostgreSQL connection pool
}

seed();
