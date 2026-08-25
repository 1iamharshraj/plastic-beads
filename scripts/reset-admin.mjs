import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL is required");
  process.exit(1);
}

const email = (process.argv[2] || "admin@gmail.com").toLowerCase();
const password = process.argv[3] || "u2B$ZZgc2hHulZdA";

const sql = neon(DATABASE_URL);

async function main() {
  const hash = await bcrypt.hash(password, 10);

  const rows = await sql`
    UPDATE users
    SET "passwordHash" = ${hash}, role = 'admin'
    WHERE email = ${email}
    RETURNING id, email, role
  `;

  if (rows.length === 0) {
    console.error("User not found:", email);
    process.exit(1);
  }

  console.log("Password reset for:", rows[0]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
