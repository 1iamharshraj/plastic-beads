import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

async function run() {
  const db = drizzle(process.env.DATABASE_URL);
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Migrations applied successfully.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
