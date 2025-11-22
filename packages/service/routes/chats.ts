import { Hono } from "hono";
import { respond } from "../lib/Router";
import { db } from "../db/client";

const app = new Hono();

app.post('/chats', async (c) => {
    const chatId = Bun.randomUUIDv7();

    return respond.ok(c, { chatId }, 'Chat registered successfully', 200);
});

app.get("/chats", async (c) => {
    const chats = await db.getAllChatIds();
    return respond.ok(c, { chats }, 'Chats retrieved successfully', 200);
});
