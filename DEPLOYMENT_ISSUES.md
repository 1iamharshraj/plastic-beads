# Deployment Issues Log

This file tracks issues encountered during Vercel deployment and their fixes so they can be avoided in future projects.

---

## Issue 1: Vercel functions pattern mismatch

**Error:**
```
Error: The pattern "vercel/api/index.ts" defined in `functions` doesn't match any Serverless Functions inside the `api` directory.
```

**Root cause:**
Vercel only recognizes serverless functions that live inside an `api/` directory at the project root. Functions defined under a non-standard path like `vercel/api/index.ts` are not discovered, even if `vercel.json` points to them explicitly.

**Fix:**
- Move the Vercel function entry to `api/index.ts` at the project root.
- Update `vercel.json`:
  - `functions`: `"api/index.ts"`
  - `rewrites`: `destination`: `"/api/index.ts"`
- Keep the main backend source in a separate directory (`server/`) so only `api/index.ts` is treated as a function.

**Files changed:**
- Created `api/index.ts` exporting `handle(app)`.
- Removed `vercel/api/index.ts`.
- Updated `vercel.json`.

---

## Issue 2: Server returns HTML error page instead of JSON on registration/login

**Symptom:**
Registration or login on Vercel shows:
```
Unexpected token 'A', "A server e"... is not valid JSON
```

**Root cause:**
The `pg` (node-postgres) driver does not always work reliably inside Vercel Serverless Functions when connecting to Neon over TCP. When the database connection fails, the function throws before the tRPC handler can return JSON, and Vercel responds with a generic HTML error page. The frontend then fails to parse that HTML as JSON.

**Fix:**
- Switch the Drizzle driver from `drizzle-orm/node-postgres` + `pg` to `drizzle-orm/neon-serverless` + `@neondatabase/serverless`.
- Update `server/queries/connection.ts` to pass the connection string directly:
  ```ts
  import { drizzle } from "drizzle-orm/neon-serverless";
  const db = drizzle(env.databaseUrl, { schema: fullSchema });
  ```
- Update `scripts/migrate.mjs` to use the same Neon serverless driver.
- Improve frontend error handling to display a friendly message when the server returns non-JSON (e.g. an HTML error page).

**Files changed:**
- `server/queries/connection.ts`
- `scripts/migrate.mjs`
- `package.json` / `package-lock.json` (added `@neondatabase/serverless`)
- `src/pages/Login.tsx` (better error formatting)

---
