// import { Hono } from "hono";
// import db from "../db/client";
// import { respond } from "../lib/Router";

// const app = new Hono();

// app.post("/:id", async (c) => {
//   const agentId = c.req.param("id");

//   if (!agentId) {
//     return respond.err(c, "Agent ID is required", 400);
//   }

//   const body = (await c.req.json()) as {
//     label?: string;
//     kind?: "builtin" | "mcp";
//     ref?: string;
//     config?: Record<string, any>;
//   };
//   const { label, kind, ref, config } = body;

//   if (!label || typeof label !== "string") {
//     return respond.err(c, "label is required and must be a string", 400);
//   }
//   if (!kind || (kind !== "builtin" && kind !== "mcp")) {
//     return respond.err(
//       c,
//       'kind is required and must be "builtin" or "mcp"',
//       400,
//     );
//   }
//   if (!ref || typeof ref !== "string") {
//     return respond.err(c, "ref is required and must be a string", 400);
//   }

//   const agent = await db.getAgent({ id: agentId });
//   if (!agent) {
//     return respond.err(c, `Agent with ID ${agentId} not found`, 404);
//   }

//   const toolId = Bun.randomUUIDv7();

//   const newTool = {
//     id: toolId,
//     name: label,
//     kind,
//     ref,
//     enabled: true,
//     config: config || undefined,
//   };

//   const updatedTools = [...(agent.tools || []), newTool];
//   await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

//   return respond.ok(c, { toolId }, "Tool added successfully", 200);
// });

// // Remove a tool from an agent
// app.delete("/:id/:toolId", async (c) => {
//   const agentId = c.req.param("id");
//   const toolId = c.req.param("toolId");

//   if (!agentId) {
//     return respond.err(c, "Agent ID is required", 400);
//   }
//   if (!toolId) {
//     return respond.err(c, "Tool ID is required", 400);
//   }

//   const agent = await db.getAgent({ id: agentId });
//   if (!agent) {
//     return respond.err(c, `Agent with ID ${agentId} not found`, 404);
//   }

//   const updatedTools = (agent.tools || []).filter(
//     (tool: { id: string }) => tool.id !== toolId,
//   );

//   if (updatedTools.length === agent.tools.length) {
//     return respond.err(c, `Tool with ID ${toolId} not found`, 404);
//   }

//   await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

//   return respond.ok(c, { agentId, toolId }, "Tool removed successfully", 200);
// });

// // Toggle tool enabled/disabled state
// app.patch("/:id/:toolId/toggle", async (c) => {
//   const agentId = c.req.param("id");
//   const toolId = c.req.param("toolId");

//   if (!agentId) {
//     return respond.err(c, "Agent ID is required", 400);
//   }
//   if (!toolId) {
//     return respond.err(c, "Tool ID is required", 400);
//   }

//   const agent = await db.getAgent({ id: agentId });
//   if (!agent) {
//     return respond.err(c, `Agent with ID ${agentId} not found`, 404);
//   }

//   const tools = agent.tools || [];
//   const toolIndex = tools.findIndex(
//     (tool: { id: string }) => tool.id !== toolId,
//   );

//   if (toolIndex === -1) {
//     return respond.err(c, `Tool with ID ${toolId} not found`, 404);
//   }

//   const updatedTools = [...tools];
//   updatedTools[toolIndex] = {
//     ...updatedTools[toolIndex],
//     enabled: !updatedTools[toolIndex].enabled,
//   };

//   await db.updateAgent({ id: agentId, updates: { tools: updatedTools } });

//   return respond.ok(
//     c,
//     {
//       toolId,
//       enabled: updatedTools[toolIndex].enabled,
//     },
//     "Tool toggled successfully",
//     200,
//   );
// });

// export default app;
