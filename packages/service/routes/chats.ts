import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { InsertMessageSchema } from "../lib/zod";
import { Agent } from "../lib/Agent";

const app = new Hono();

// List all conversations (chats) for the user
app.get("/", authenticated, async (ctx) => {
  const walletAddress = ctx.var.userWallet;
  const chats = await db.getChatsByWallet({ walletAddress });
  return respond.ok(ctx, { chats }, "Chats retrieved successfully", 200);
});

// Start a new conversation
app.post("/", authenticated, async (ctx) => {
  const walletAddress = ctx.var.userWallet;
  const chatId = Bun.randomUUIDv7();
  
  // Optional: if body contains agentId, we can link it.
  const body = await ctx.req.json().catch(() => ({}));
  const agentId = body.agentId ? Number(body.agentId) : undefined;

  await db.createChat({
    chatId,
    walletAddress,
    agentId
  });

  return respond.ok(ctx, { chatId }, "Chat registered successfully", 201);
});

// Get message history for a specific conversation
app.get("/:id/messages", authenticated, async (ctx) => {
  const chatId = ctx.req.param("id");
  
  // Verify ownership (optional but recommended)
  const chat = await db.getChat({ chatId });
  if (!chat) {
    return respond.err(ctx, "Chat not found", 404);
  }
  if (chat.walletAddress !== ctx.var.userWallet) {
    return respond.err(ctx, "Unauthorized", 403);
  }

  const messages = await db.getChatHistory({ chatId });
  return respond.ok(ctx, { messages }, "History retrieved successfully", 200);
});

// Send a message
app.post("/:id/messages", authenticated, async (ctx) => {
  const chatId = ctx.req.param("id");
  const body = await ctx.req.json();

  // Validate input
  const result = InsertMessageSchema.safeParse({
    chatId,
    role: body.role || "user",
    content: body.content
  });

  if (!result.success) {
    return respond.err(ctx, "Invalid request body", 400);
  }

  // Verify ownership
  const chat = await db.getChat({ chatId });
  if (!chat) {
    return respond.err(ctx, "Chat not found", 404);
  }
  if (chat.walletAddress !== ctx.var.userWallet) {
    return respond.err(ctx, "Unauthorized", 403);
  }

  // Get the agent for this chat
  if (!chat.agentId) {
    return respond.err(ctx, "Chat has no associated agent", 400);
  }

  const agentData = await db.getAgent({ id: chat.agentId.toString() });
  if (!agentData) {
    return respond.err(ctx, "Agent not found", 404);
  }

  // Insert user message
  await db.insertMessage(result.data);

  try {
    // Generate AI response using Agent class
    const agent = await Agent.fromId({ id: agentData.id });
    const aiResponse = await agent.generateResponse({
      message: result.data.content,
      chatId: chatId
    });

    // Insert AI response
    await db.insertMessage({
      chatId,
      role: "assistant",
      content: aiResponse
    });

    return respond.ok(ctx, {
      message: aiResponse,
      role: "assistant",
      chatId
    }, "Message sent successfully", 201);

  } catch (error) {
    console.error("Error generating AI response:", error);
    return respond.err(ctx, "Failed to generate response", 500);
  }
});

export default app;
