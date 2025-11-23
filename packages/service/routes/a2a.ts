import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  getAgentCard,
  handleJsonRpc,
  createAgentCard,
  updateAgentCard,
} from "../lib/a2a";
import { respond } from "../lib/Router";
import { CreateAgentCardSchema, UpdateAgentCardSchema } from "../lib/zod";
import db from "../db/client";
import schema from "../db/schema";

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
  // Get address from query param or header
  const address =
    c.req.query("address") ||
    c.req.header("x-agent-address") ||
    c.req.header("agent-address");

  if (!address) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32602,
          message:
            "Agent address required (query param 'address' or header 'x-agent-address')",
        },
      },
      400,
    );
  }

  // Look up agent by address to get agent ID
  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.address, address))
    .limit(1);

  if (!agent) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: `Agent with address ${address} not found`,
        },
      },
      404,
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

  // Handle JSON-RPC methods using the agent ID
  const response = await handleJsonRpc(agent.id.toString(), body);
  return c.json(response, 200);
});


app.post("/agents/:address/agent-card", async (c) => {
  try {
    const address = c.req.param("address");
    const body = await c.req.json();

    // Validate request body
    const validated = CreateAgentCardSchema.parse({
      address,
      card: body,
    });

    const card = await createAgentCard({
      agentId: validated.agentId,
      card: validated.card,
    });

    return respond.ok(
      c,
      { card },
      "Agent card created successfully",
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.err(
        c,
        `Validation error: ${error.message}`,
        400,
      );
    }
    return respond.err(
      c,
      error instanceof Error ? error.message : "Failed to create agent card",
      500,
    );
  }
});

// Update agent card
app.patch("/agents/:address/agent-card", async (c) => {
  try {
    const address = c.req.param("address");
    const body = await c.req.json();

    // Validate request body
    const validated = UpdateAgentCardSchema.parse({
      address,
      updates: body,
    });

    const card = await updateAgentCard({
      agentId: validated.id,
      updates: validated.updates,
    });

    return respond.ok(
      c,
      { card },
      "Agent card updated successfully",
      200,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respond.err(
        c,
        `Validation error: ${error.message}`,
        400,
      );
    }
    return respond.err(
      c,
      error instanceof Error ? error.message : "Failed to update agent card",
      500,
    );
  }
});


export default app;
