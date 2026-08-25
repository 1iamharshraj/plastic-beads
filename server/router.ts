import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboardRouter";
import { formulaRouter } from "./formulaRouter";
import { materialRouter } from "./materialRouter";
import { productionRouter } from "./productionRouter";
import { settingsRouter } from "./settingsRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  materials: materialRouter,
  formulas: formulaRouter,
  production: productionRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
