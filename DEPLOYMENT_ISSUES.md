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

## Issue 3: Vercel runtime `ERR_MODULE_NOT_FOUND` for `server/app`

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/app' imported from /var/task/api/index.js
```

**Symptom:**
Every `/api/trpc/*` request returns a 500. The function starts but cannot resolve `../server/app` because the `server/` directory is not deployed with the Vercel function.

**Root cause:**
`api/index.ts` used `await import("../server/app")`. esbuild treats dynamic `import()` as an external module by default, so it is not bundled into `api/index.js`. At runtime Vercel only has `api/index.js` (and the files listed in `.vercelignore` exclusions), not the `server/` source, so the relative import fails.

**Fix:**
1. Change `api/index.ts` to a static import so esbuild bundles the entire backend into the function:
   ```ts
   import { handle } from "hono/vercel";
   import app from "../server/app";
   export default handle(app);
   ```
2. Build `api/index.js` locally as part of the build script:
   ```json
   "build": "vite build && esbuild server/boot.ts ... --outdir=dist && esbuild api/index.ts --platform=node --bundle --format=esm --outfile=api/index.js ..."
   ```
3. Point Vercel at the compiled JS file:
   - `vercel.json` `functions`: `"api/index.js"`
   - `vercel.json` `rewrites` `destination`: `"/api/index.js"`
4. Ignore the source/backend from Vercel upload so only `api/index.js` is the function:
   - `.vercelignore`: add `server/`, `api/index.ts`, `db/migrations/meta`
5. Ignore the build artifact from Git:
   - `.gitignore`: add `api/index.js`
   - `eslint.config.js` `globalIgnores`: add `api/index.js`

**Files changed:**
- `api/index.ts`
- `package.json`
- `vercel.json`
- `.vercelignore`
- `.gitignore`
- `eslint.config.js`
- `DEPLOYMENT_ISSUES.md`

---
