import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { InsertMessageSchema } from "../lib/zod";

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

  // TODO: Implement logic
});

export default app;
