import { Hono } from "hono";

import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";

const app = new Hono();

app.post("/chats", async (ctx) => {
  const chatId = Bun.randomUUIDv7();

  return respond.ok(ctx, { chatId }, "Chat registered successfully", 200);
});

app.get("/chats", authenticated, async (ctx) => {
  const walletAddress = ctx.var.userWallet;
  const chats = await db.getChatsByWallet({ walletAddress });
  return respond.ok(ctx, { chats }, "Chats retrieved successfully", 200);
});
