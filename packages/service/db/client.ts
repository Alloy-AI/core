import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { env } from "../env";
import * as schema from "./schema";

const db: NodePgDatabase<typeof schema> = drizzle(env.PG_URI, {
  schema,
  casing: "snake_case",
});

export default db;

// Types
type AgentInsert = InferInsertModel<typeof schema.agents>;
type AgentUpdate = Partial<InferSelectModel<typeof schema.agents>>;

// Helper functions using Drizzle

export async function getAgent(args: { id?: string; address?: string }) {
  if (args.id) {
    const result = await db.select().from(schema.agents).where(eq(schema.agents.id, parseInt(args.id)));
    if (result.length === 0) return null;
    const agent = result[0];
    return {
      ...agent,
      id: String(agent.id),
      knowledgeBases: agent.knowledgeBases || [],
      tools: agent.tools || [],
      mcpServers: agent.mcpServers || [],
    };
  } else if (args.address) {
    const result = await db.select().from(schema.agents).where(eq(schema.agents.address, args.address));
    if (result.length === 0) return null;
    const agent = result[0];
    return {
      ...agent,
      id: String(agent.id),
      knowledgeBases: agent.knowledgeBases || [],
      tools: agent.tools || [],
      mcpServers: agent.mcpServers || [],
    };
  }
  return null;
}

export async function getAllAgents() {
  const results = await db.select().from(schema.agents);
  return results.map((agent) => ({
    ...agent,
    id: String(agent.id),
    knowledgeBases: agent.knowledgeBases || [],
    tools: agent.tools || [],
    mcpServers: agent.mcpServers || [],
  }));
}

export async function createAgent(args: { agentData: AgentInsert }) {
  const result = await db.insert(schema.agents).values(args.agentData).returning({ id: schema.agents.id });
  return { id: result[0].id };
}

export async function updateAgent(args: { id: string; updates: AgentUpdate }) {
  await db.update(schema.agents).set(args.updates).where(eq(schema.agents.id, parseInt(args.id)));
}

export async function getChatsByWallet(args: { walletAddress: string }) {
  return await db.select().from(schema.chats).where(eq(schema.chats.walletAddress, args.walletAddress));
}

export async function createChat(args: { chatId: string; walletAddress: string; agentId?: number }) {
  await db.insert(schema.chats).values({
    id: args.chatId,
    walletAddress: args.walletAddress,
    agentId: args.agentId,
  });
}

export async function getChat(args: { chatId: string }) {
  const result = await db.select().from(schema.chats).where(eq(schema.chats.id, args.chatId));
  if (result.length === 0) return null;
  return result[0];
}

export async function getChatHistory(args: { chatId: string }) {
  return await db.select().from(schema.chatHistory).where(eq(schema.chatHistory.chatId, args.chatId)).orderBy(schema.chatHistory.timestamp);
}

export async function insertMessage(args: { chatId: string; role: string; content: string }) {
  await db.insert(schema.chatHistory).values({
    chatId: args.chatId,
    role: args.role,
    content: args.content,
  });
}

export async function getAgentCard(args: { agentId: string }) {
  const result = await db.select().from(schema.agentCards).where(eq(schema.agentCards.agentId, parseInt(args.agentId)));
  if (result.length === 0) return null;
  return result[0];
}
