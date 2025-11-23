import { Hono } from "hono";
import { respond } from "../lib/Router";
import { getAgentCard, handleJsonRpc } from "../lib/a2a";

const app = new Hono();


app.get("/agents/:id/.well-known/agent.json", async (c) => {
  const { id } = c.req.param();
  const card = await getAgentCard({ agentId: id });

  if (!card) {
    return respond.err(c, `Agent card for agent ${id} not found`, 404);
  }

  // Return raw JSON (not wrapped in respond.ok format) for A2A compliance
  return c.json(card, 200);
});

app.get("/.well-known/agent.json", async (c) => {
  const agentId = c.req.query("agentId") || c.req.header("x-agent-id");

  if (!agentId) {
    return respond.err(
      c,
      "Agent ID required (query param 'agentId' or header 'x-agent-id')",
      400,
    );
  }

  const card = await getAgentCard({ agentId });

  if (!card) {
    return respond.err(c, `Agent card for agent ${agentId} not found`, 404);
  }

  return c.json(card, 200);
});

app.post("/agents/:id/a2a", async (c) => {
  const { id: agentId } = c.req.param();
  const body = await c.req.json();

  // Validate JSON-RPC 2.0 request
  if (body.jsonrpc !== "2.0" || !body.method) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: body.id || null,
        error: {
          code: -32600,
          message: "Invalid Request",
        },
      },
      400,
    );
  }

  // Handle JSON-RPC methods
  const response = await handleJsonRpc(agentId, body);
  return c.json(response, 200);
});

app.post("/a2a", async (c) => {
  const agentId =
    c.req.query("agentId") ||
    c.req.header("x-agent-id") ||
    c.req.header("agent-id");

  if (!agentId) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32602,
          message:
            "Agent ID required (query param 'agentId' or header 'x-agent-id')",
        },
      },
      400,
    );
  }

  const body = await c.req.json();

  // Validate JSON-RPC 2.0 request
  if (body.jsonrpc !== "2.0" || !body.method) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: body.id || null,
        error: {
          code: -32600,
          message: "Invalid Request",
        },
      },
      400,
    );
  }

  // Handle JSON-RPC methods
  const response = await handleJsonRpc(agentId, body);
  return c.json(response, 200);
});

export default app;

