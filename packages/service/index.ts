import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { env } from "./env";
import { appd } from "./lib/appd";
import { respond } from "./lib/Router";
import a2a from "./routes/a2a";
// Route imports
import agents from "./routes/agents";
import chats from "./routes/chats";
import tools from "./routes/tools";
import { privateKeyToAddress } from "viem/accounts";

const app = new Hono();

app.use(logger());
app.use(cors());

app.get("/app-id", (c) => {
  return respond.ok(c, { appId: appd.getAppId() }, "", 200);
});

app.get("/evm-address", async (c) => {
  const pvtKey = await appd.getEvmSecretKey("global");
  return respond.ok(c, { address: privateKeyToAddress(pvtKey) }, "", 200);
});

app.route("/", a2a);
app.route("/tools", tools);
app.route("/agents", agents);
app.route("/chats", chats);

const _server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Server running on port ${env.PORT}`);
