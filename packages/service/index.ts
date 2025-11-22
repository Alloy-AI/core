import { appd } from "./lib/appd";
import { Hono } from "hono";
import { respond } from "./lib/Router";
import { db } from "./db/client";

const app = new Hono();

app.get('/app-id', (c) => {
    return respond.ok(c, { appId: appd.getAppId() }, '', 200);
});

app.post('/agents', (c) => {
    return respond.ok(c, { status: 'ok' }, '', 200);
});

app.get('/agents/:id/pk', (c) => {
    return respond.ok(c, { status: 'ok' }, '', 200);
});

/**
 * Register a new chat session
 * POST /chats
 * Returns: { chatId: string }
 */
app.post('/chats', async (c) => {
    // Generate a unique chat ID
    const chatId = Bun.randomUUIDv7();
    return respond.ok(c, { chatId }, 'Chat registered successfully', 200);
});

/**
 * Update base system prompt for an agent
 * PUT /base-system-prompt/:id
 * Body: { baseSystemPrompt: string }
 * Returns: { success: true }
 */
app.put('/base-system-prompt/:id', async (c) => {
    const agentId = c.req.param('id');
    
    if (!agentId) {
        return respond.err(c, 'Agent ID is required', 400);
    }
    
    // Parse request body
    const body = await c.req.json() as { baseSystemPrompt?: string };
    const { baseSystemPrompt } = body;

    if (!baseSystemPrompt || typeof baseSystemPrompt !== 'string') {
        return respond.err(c, 'baseSystemPrompt is required and must be a string', 400);
    }

    // Check if agent exists
    const agent = await db.getAgent({ id: agentId });
    if (!agent) {
        return respond.err(c, `Agent with ID ${agentId} not found`, 404);
    }

    // Update the base system prompt
    await db.updateAgent({ id: agentId, updates: { baseSystemPrompt } });

    return respond.ok(c, { agentId, baseSystemPrompt }, 'Base system prompt updated successfully', 200);
});

/**
 * Add a tool to an agent
 * POST /tools/:id
 * Body: { label: string; kind: "builtin" | "mcp"; ref: string; config?: Record<string, any> }
 * Returns: { toolId: string }
 */
app.post('/tools/:id', async (c) => {
    const agentId = c.req.param('id');
    
    if (!agentId) {
        return respond.err(c, 'Agent ID is required', 400);
    }

    // Parse request body
    const body = await c.req.json() as { 
        label?: string; 
        kind?: "builtin" | "mcp"; 
        ref?: string; 
        config?: Record<string, any> 
    };
    const { label, kind, ref, config } = body;

    if (!label || typeof label !== 'string') {
        return respond.err(c, 'label is required and must be a string', 400);
    }
    if (!kind || (kind !== 'builtin' && kind !== 'mcp')) {
        return respond.err(c, 'kind is required and must be "builtin" or "mcp"', 400);
    }
    if (!ref || typeof ref !== 'string') {
        return respond.err(c, 'ref is required and must be a string', 400);
    }

    // Check if agent exists
    const agent = await db.getAgent({ id: agentId });
    if (!agent) {
        return respond.err(c, `Agent with ID ${agentId} not found`, 404);
    }

    // Generate tool ID
    const toolId = Bun.randomUUIDv7();

    // Create new tool
    const newTool = {
        id: toolId,
        name: label,
        kind,
        ref,
        enabled: true,
        config: config || undefined,
    };

    // Add tool to agent's tools array
    const updatedTools = [...(agent.tools || []), newTool];
    await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

    return respond.ok(c, { toolId }, 'Tool added successfully', 200);
});

/**
 * Remove a tool from an agent
 * DELETE /tools/:id/:toolId
 * Returns: { success: true }
 */
app.delete('/tools/:id/:toolId', async (c) => {
    const agentId = c.req.param('id');
    const toolId = c.req.param('toolId');
    
    if (!agentId) {
        return respond.err(c, 'Agent ID is required', 400);
    }
    if (!toolId) {
        return respond.err(c, 'Tool ID is required', 400);
    }

    // Check if agent exists
    const agent = await db.getAgent({ id: agentId });
    if (!agent) {
        return respond.err(c, `Agent with ID ${agentId} not found`, 404);
    }

    // Remove tool from agent's tools array
    const updatedTools = (agent.tools || []).filter((tool: { id: string }) => tool.id !== toolId);
    
    if (updatedTools.length === agent.tools.length) {
        return respond.err(c, `Tool with ID ${toolId} not found`, 404);
    }

    await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

    return respond.ok(c, { agentId, toolId }, 'Tool removed successfully', 200);
});

/**
 * Toggle a tool's enabled status
 * PATCH /tools/:id/:toolId/toggle
 * Returns: { toolId: string, enabled: boolean }
 */
app.patch('/tools/:id/:toolId/toggle', async (c) => {
    const agentId = c.req.param('id');
    const toolId = c.req.param('toolId');
    
    if (!agentId) {
        return respond.err(c, 'Agent ID is required', 400);
    }
    if (!toolId) {
        return respond.err(c, 'Tool ID is required', 400);
    }

    // Check if agent exists
    const agent = await db.getAgent({ id: agentId });
    if (!agent) {
        return respond.err(c, `Agent with ID ${agentId} not found`, 404);
    }

    // Find and toggle tool
    const tools = agent.tools || [];
    const toolIndex = tools.findIndex((tool: { id: string }) => tool.id === toolId);
    
    if (toolIndex === -1) {
        return respond.err(c, `Tool with ID ${toolId} not found`, 404);
    }

    // Toggle enabled status
    const updatedTools = [...tools];
    updatedTools[toolIndex] = {
        ...updatedTools[toolIndex],
        enabled: !updatedTools[toolIndex].enabled,
    };

    await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

    return respond.ok(c, { 
        toolId, 
        enabled: updatedTools[toolIndex].enabled 
    }, 'Tool toggled successfully', 200);
});

const server = Bun.serve({
    port: 3000,
    fetch: app.fetch,
});

console.log(`Server running on http://localhost:${server.port}`);
