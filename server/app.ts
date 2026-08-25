import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/api/health", (c) => c.json({ ok: true, env: env.isProduction ? "production" : "development" }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

/* TEMP-QA-ROUTE: removed before delivery */
if (!env.isProduction) {
  app.get("/api/dev-session", async (c) => {
    const { signSessionToken } = await import("./auth/session");
    const { createUser, findUserByEmail } = await import("./queries/users");
    const email = "qa@beadfactory.dev";
    let u = await findUserByEmail(email);
    if (!u) {
      u = await createUser({
        email,
        name: "QA Factory",
        passwordHash: "qa-not-a-real-hash",
      });
    }
    const token = await signSessionToken({ userId: u.id });
    c.header("set-cookie", `sid=${token}; Path=/; HttpOnly; SameSite=Lax`);
    return c.json({ ok: true, userId: u?.id });
  });
}

app.onError((err, c) => {
  console.error("[server error]", err);
  return c.json({ error: "Internal server error", message: env.isProduction ? undefined : String(err) }, 500);
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
