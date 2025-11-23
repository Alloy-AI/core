import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { tryCatch } from "../lib/tryCatch";

const app = new Hono();

// Get all agents
app.get("/", authenticated, async (c) => {
    const agents = await db.getAllAgents({});
    return respond.ok(c, { agents }, "Agents retrieved successfully", 200);
});

// Create a new agent
app.post("/", authenticated, async (c) => {
    const body = await tryCatch(c.req.json());
    if (body.error) {
        return respond.err(c, `Invalid JSON body ${body.error}`, 400);
    }
    const opts = body.data as { name: string; description: string; model: string; baseSystemPrompt: string; };

    const agentId = await tryCatch(db.createAgent({ agentData: {
        name: opts.name,
        description: opts.description,
        model: opts.model,
        baseSystemPrompt: opts.baseSystemPrompt,
        registrationPieceCid: "",
        knowledgeBases: [],
        tools: [],
        mcpServers: [],
    } }));

    if (agentId.error) {
        return respond.err(c, `Failed to create agent in db ${agentId.error.message}`, 500);
    }

    return respond.ok(c, { agentId: agentId.data }, "Agent created successfully", 201);
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

    const agent = await db.getAgent({ id });
    if (!agent) {
        return respond.err(c, "Agent not found", 404);
    }

    await db.updateAgent(updatePayload);
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
