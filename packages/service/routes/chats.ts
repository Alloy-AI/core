import { Hono } from "hono";
import z from "zod";
import { Agent } from "../lib/Agent";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import db from "../db/client";
import schema from "../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// List all conversations (chats) for the user
app.get("/", authenticated, async (ctx) => {
  const walletAddress = ctx.var.userWallet;
  const chats = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.walletAddress, walletAddress));
  return respond.ok(ctx, { chats }, "Chats retrieved successfully", 200);
});

// Start a new conversation
app.post("/", authenticated, async (ctx) => {
  const rawBody = await ctx.req.json();
  const parsedBody = z
    .object({
      agentId: z.number().optional(),
    })
    .safeParse(rawBody);

  if (!parsedBody.success) {
    return respond.err(
      ctx,
      `Invalid request body: ${parsedBody.error.message}`,
      400,
    );
  }

  const walletAddress = ctx.var.userWallet;
  const chatId = Bun.randomUUIDv7();

  await db.insert(schema.chats).values({
    id: chatId,
    walletAddress,
    agentId: parsedBody.data.agentId,
  });

  return respond.ok(ctx, { chatId }, "Chat registered successfully", 201);
});

// Update chat (e.g., associate an agent)
app.put("/:id", authenticated, async (ctx) => {
  const chatId = ctx.req.param("id");
  const body = await ctx.req.json();

  const parsedBody = z
    .object({
      agentId: z.number().optional(),
    })
    .safeParse(body);

  if (!parsedBody.success) {
    return respond.err(
      ctx,
      `Invalid request body: ${parsedBody.error.message}`,
      400,
    );
  }

  // Verify ownership
  const [chat] = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.id, chatId));
  if (!chat) {
    return respond.err(ctx, "Chat not found", 404);
  }
  if (chat.walletAddress !== ctx.var.userWallet) {
    return respond.err(ctx, "Unauthorized", 403);
  }

  // Update agentId if provided
  if (parsedBody.data.agentId !== undefined) {
    // Verify agent exists
    const [agent] = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, parsedBody.data.agentId));
    if (!agent) {
      return respond.err(ctx, "Agent not found", 404);
    }

    await db
      .update(schema.chats)
      .set({ agentId: parsedBody.data.agentId })
      .where(eq(schema.chats.id, chatId));
  }

  const [updatedChat] = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.id, chatId));

  return respond.ok(ctx, { chat: updatedChat }, "Chat updated successfully", 200);
});

// Get message history for a specific conversation
app.get("/:id/messages", authenticated, async (ctx) => {
  const chatId = ctx.req.param("id");

  // Verify ownership (optional but recommended)
  const [chat] = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.id, chatId));
  if (!chat) {
    return respond.err(ctx, "Chat not found", 404);
  }
  if (chat.walletAddress !== ctx.var.userWallet) {
    return respond.err(ctx, "Unauthorized", 403);
  }

  const messages = await db
    .select()
    .from(schema.chatHistory)
    .where(eq(schema.chatHistory.chatId, chatId));
  return respond.ok(ctx, { messages }, "History retrieved successfully", 200);
});

// Send a message
app.post("/:id/messages", authenticated, async (ctx) => {
  const chatId = ctx.req.param("id");
  const body = await ctx.req.json();

  const messageData = {
    chatId,
    role: body.role || "user",
    content: body.content,
  };

  // Verify ownership
  const [chat] = await db
    .select()
    .from(schema.chats)
    .where(eq(schema.chats.id, chatId));
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

  const [agentData] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.id, chat.agentId));
  if (!agentData) {
    return respond.err(ctx, "Agent not found", 404);
  }

  // Insert user message
  await db.insert(schema.chatHistory).values(messageData);

  try {
    // Generate AI response using Agent class
    const agent = await Agent.fromId({ id: agentData.id });
    const aiResponse = await agent.generateResponse({
      message: messageData.content,
      chatId: chatId,
    });

    // Insert AI response
    await db.insert(schema.chatHistory).values({
      chatId,
      role: "assistant",
      content: aiResponse,
    });

    return respond.ok(
      ctx,
      {
        message: aiResponse,
        role: "assistant",
        chatId,
      },
      "Message sent successfully",
      201,
    );
  } catch (error) {
    console.error("Error generating AI response:", error);
    return respond.err(ctx, "Failed to generate response", 500);
  }
});

export default app;
