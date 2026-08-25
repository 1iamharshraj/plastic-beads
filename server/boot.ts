import { serve } from "@hono/node-server";
import app from "./app";
import { serveStaticFiles } from "./lib/vite";

serveStaticFiles(app);

export default app;

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
