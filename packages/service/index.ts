import { Hono } from "hono";
import { appd } from "./lib/appd";
import { respond } from "./lib/Router";
import agents from "./routes/agents";
import chats from "./routes/chats";
import { env } from "./env";

const app = new Hono();

// Mount new routes
app.route("/agents", agents);
app.route("/chats", chats);

app.get("/app-id", (c) => {
  return respond.ok(c, { appId: appd.getAppId() }, "", 200);
});

app.get("/agents/:id/pk", (c) => {
  return respond.ok(c, { status: "ok" }, "", 200);
});

Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
})
console.log("\n\nRUNNING SERVICE ON PORT", env.PORT);
