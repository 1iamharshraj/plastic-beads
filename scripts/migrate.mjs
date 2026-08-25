import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./db/migrations" });
  await client.end();
  console.log("Migrations applied successfully.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
