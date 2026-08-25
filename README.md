# BeadFactory Pro

A full-stack Progressive Web App for plastic bead manufacturing: raw material
inventory, color formulation recipes, production feasibility analysis, and
customer pricing estimates — on the factory floor and on the phone.

## Stack

- **Frontend**: React 19 + TypeScript + Vite (config-driven landing site in `src/config.ts`)
- **Backend**: Hono + tRPC 11 (end-to-end type safety, superjson transport)
- **Database**: PostgreSQL via Drizzle ORM (`db/schema.ts`)
- **Auth**: Local email/password with bcrypt + JWT session (httpOnly cookie)
- **PWA**: `public/manifest.webmanifest` + `public/sw.js` (cache-first static assets,
  network-first API reads with offline fallback), install prompt on mobile

## Modules

| Route | What it does |
| --- | --- |
| `/` | Landing page (hero, capabilities, floor gallery) |
| `/login` | Sign in / register |
| `/dashboard` | Overview: material/formula counts, stock value, recent orders |
| `/dashboard/materials` | Raw material CRUD, search, live stock value |
| `/dashboard/formulas` | Colors → variants → material ratios, inline editing |
| `/dashboard/production` | Feasibility check + cost breakdown + customer estimate |
| `/dashboard/history` | Saved production orders, filters, read-only breakdowns |
| `/dashboard/settings` | Fixed cost/kg, profit margin, JSON data export |

New accounts are seeded with demo materials and formulas on first dashboard
visit (`server/seedDemo.ts`).

## Commands

```bash
npm install        # Node.js 20.19 or newer
npm run dev        # dev server on port 3000 (frontend + API)
npm run check      # tsc -b type check
npm run build      # production build (dist/public + dist/boot.js)
npm start          # production server on port 3000
npm run db:migrate # apply Drizzle migrations
npm run db:push    # sync Drizzle schema to the database
npx tsx db/seed.ts # seed demo data for the owner account
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` — your PostgreSQL connection string (e.g. Neon)
   - `APP_SECRET` — strong random string for JWT signing
   - `OWNER_EMAIL` — email address that gets the `admin` role on first registration
   - `NODE_ENV` — `production`
4. Deploy. The static site is served from `dist/public` and API routes are handled by `vercel/api/index.ts`.

> Note: after the first deploy, run `npm run db:migrate` (or `npm run db:push`) against your database to create tables, then visit `/login` and register. Set `OWNER_EMAIL` to the admin email before registering if you want that account to be `admin`.

## Business logic

- **Feasibility**: `scaleFactor = requiredQty / Σ(ratios)`, `neededQty = ratio × scaleFactor`;
  any `neededQty > stock` marks the order infeasible and lists the shortage.
- **Costing**: `materialCost = Σ(neededQty × pricePerUnit)`,
  `fixedCost = requiredQty × fixedCostPerKg`, `total = material + fixed`,
  `customerPrice = total × (1 + profitPercent/100)`. All money rounded to 2 decimals (₹).
