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
