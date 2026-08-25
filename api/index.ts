import { Hono } from "hono";
import { handle } from "hono/vercel";

async function loadApp() {
  try {
    const { default: app } = await import("../server/app");
    return app;
  } catch (err) {
    console.error("[vercel] Failed to import server/app:", err);
    const details = err instanceof Error ? err.message : String(err);
    return new Hono().all("/api/*", (c) =>
      c.json({ error: "Server failed to start", details }, 500),
    );
  }
}

const appPromise = loadApp();
const wrapper = new Hono();

wrapper.all("/api/*", async (c) => {
  const app = await appPromise;
  return app.fetch(c.req.raw, c.env);
});

export default handle(wrapper);
