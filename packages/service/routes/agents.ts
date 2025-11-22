import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { CreateAgentSchema, UpdateAgentSchema } from "../lib/zod";

const app = new Hono();

// Get all agents
app.get("/", authenticated, async (c) => {
  const agents = await db.getAllAgents({});
  return respond.ok(c, { agents }, "Agents retrieved successfully", 200);
});

// Create a new agent
app.post("/", authenticated, async (c) => {
  const body = await c.req.json();
  const result = CreateAgentSchema.safeParse(body);

  if (!result.success) {
    return respond.err(c, "Invalid request body", 400);
  }

  const agentId = await db.createAgent({ agentData: result.data.agentData });
  return respond.ok(c, { agentId }, "Agent created successfully", 201);
});

// Get agent details
app.get("/:id", authenticated, async (c) => {
  const id = c.req.param("id");
  const agent = await db.getAgent({ id });

  if (!agent) {
    return respond.err(c, "Agent not found", 404);
  }

  return respond.ok(c, { agent }, "Agent details retrieved successfully", 200);
});

// Update agent details
app.patch("/:id", authenticated, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // Manually construct validation object to match schema
  const updatePayload = {
    id,
    updates: body,
  };

  const result = UpdateAgentSchema.safeParse(updatePayload);

  if (!result.success) {
    return respond.err(c, "Invalid request body", 400);
  }

  const agent = await db.getAgent({ id });
  if (!agent) {
    return respond.err(c, "Agent not found", 404);
  }

  await db.updateAgent(result.data);
  return respond.ok(c, { id }, "Agent updated successfully", 200);
});

// Delete an agent
app.delete("/:id", authenticated, async (c) => {
  const id = c.req.param("id");
  const agent = await db.getAgent({ id });

  if (!agent) {
    return respond.err(c, "Agent not found", 404);
  }

  await db.deleteAgent({ id });
  return respond.ok(c, { id }, "Agent deleted successfully", 200);
});

export default app;

