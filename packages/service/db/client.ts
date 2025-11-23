import { SQL } from "bun";
import { decryptSelf, encryptSelf } from "../lib/crypto";
import {
  AgentCardSchema,
  CreateAgentCardSchema,
  DeleteAgentCardSchema,
  GetAgentCardSchema,
  RawAgentCardRowSchema,
  UpdateAgentCardSchema,
} from "../lib/zod";
import { env } from "../env";
import z from "zod";

const sql = new SQL(env.PG_URI);

type AgentData = {
  name: string;
  description: string;
  model: string;
  keySeed:string;
  registrationPieceCid: string;
  baseSystemPrompt: string;
  knowledgeBases: any[];
  tools: any[];
  mcpServers: any[];
};

// Raw database row types
interface ChatHistoryRow {
  id: number;
  chat_id: string;
  wallet_address: string;
  role: string;
  content: string;
  timestamp: string;
}

interface AgentRow {
  id: number;
  name: string;
  description: string;
  model: string;
  registration_piece_cid: string;
  base_system_prompt: string;
  knowledge_bases: string;
  tools: string;
  mcp_servers: string;
}

type ChatRowType = {
  id: string;
  wallet_address: string;
  agent_id: number | null;
  created_at: string;
};

type AgentRowType = {
  id: number;
  name: string;
  description: string;
  model: string;
  registration_piece_cid: string;
  base_system_prompt: string;
  knowledge_bases: string;
  tools: string;
  mcp_servers: string;
};

type DBAgentType = {
  id: string;
  name: string;
  description: string;
  model: string;
  registrationPieceCid: string;
  baseSystemPrompt: string;
  knowledgeBases: any[];
  tools: any[];
  mcpServers: any[];
};

async function insertMessage(args: {
  chatId: string;
  role: string;
  content: string;
}) {
  const { chatId, role, content } = args;

  const encryptedContent = await encryptSelf({ message: content });

  const result = await sql`
        INSERT INTO chat_history (chat_id, role, content)
        VALUES (${chatId}, ${role}, ${encryptedContent})
        RETURNING id
    `;
  return result[0];
}

async function getChatHistory(args: { chatId: string }) {
  const { chatId } = args;
  const results = await sql`
        SELECT ch.*, c.wallet_address
        FROM chat_history ch
        JOIN chats c ON ch.chat_id = c.id
        WHERE ch.chat_id = ${chatId}
        ORDER BY ch.timestamp ASC
    `;

  return Promise.all(results.map(async (row: unknown) => {
    const rawRow = row as ChatHistoryRow;
    const decryptedRow = {
      ...rawRow,
      content: await decryptSelf({ ciphertext: rawRow.content }),
    };
    return decryptedRow as ChatHistoryRow;
  }));
}

async function getChatsByWallet(args: { walletAddress: string }) {
  const { walletAddress } = args;
  const results = await sql`
        SELECT * FROM chats
        WHERE wallet_address = ${walletAddress}
    `;

  return results.map((row: unknown) => {
    const parsedRow = row as ChatRowType;
    return {
      id: parsedRow.id,
      walletAddress: parsedRow.wallet_address,
      agentId: parsedRow.agent_id,
      createdAt: parsedRow.created_at,
    } as { id: string; walletAddress: string; agentId: number | null; createdAt: string; };
  });
}

async function deleteChatHistory(args: { chatId: string }) {
  const { chatId } = args;
  await sql`DELETE FROM chat_history WHERE chat_id = ${chatId}`;
}

async function deleteChatsByWallet(args: { walletAddress: string }) {
  const { walletAddress } = args;
  await sql`DELETE FROM chats WHERE wallet_address = ${walletAddress}`;
}

async function getAllChatIds(args: {}) {
  const results = await sql`SELECT id FROM chats`;
  return results.map((row: unknown) => {
    const parsed = row as { id: string };
    return parsed.id;
  });
}

async function createChat(args: {
  chatId: string;
  walletAddress: string;
  agentId?: number;
}) {
  const { chatId, walletAddress, agentId } = args;
  await sql`
        INSERT INTO chats (id, wallet_address, agent_id)
        VALUES (${chatId}, ${walletAddress}, ${agentId ?? null})
    `;
}

async function getChat(args: { chatId: string }) {
  const { chatId } = args;
  const result = await sql`
        SELECT * FROM chats WHERE id = ${chatId}
    `;
  if (result.length === 0) return null;
  const row = result[0] as ChatRowType;
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    agentId: row.agent_id,
    createdAt: row.created_at,
  } as { id: string; walletAddress: string; agentId: number | null; createdAt: string; };
}

async function deleteChat(args: { chatId: string }) {
  const { chatId } = args;
  await sql`DELETE FROM chats WHERE id = ${chatId}`;
}

async function createAgent(args: { agentData: AgentData }) {
  const { agentData } = args;
  const result = await sql`
        INSERT INTO agents (name, description, model, registration_piece_cid, base_system_prompt, knowledge_bases, tools, mcp_servers)
        VALUES (${agentData.name}, ${agentData.description}, ${agentData.model}, ${agentData.registrationPieceCid}, ${agentData.baseSystemPrompt}, ${JSON.stringify(agentData.knowledgeBases)}, ${JSON.stringify(agentData.tools)}, ${JSON.stringify(agentData.mcpServers)})
        RETURNING id
    `;
  return result[0];
}

async function getAgent(args: { id: string }) {
  const { id } = args;
  const result = await sql`
        SELECT * FROM agents WHERE id = ${id}
    `;
  if (result.length === 0) return null;
  const row = result[0] as AgentRowType;
  const agent = {
    id: String(row.id),
    name: row.name,
    description: row.description,
    model: row.model,
    registrationPieceCid: row.registration_piece_cid,
    baseSystemPrompt: row.base_system_prompt,
    knowledgeBases: JSON.parse(row.knowledge_bases),
    tools: JSON.parse(row.tools),
    mcpServers: JSON.parse(row.mcp_servers),
  };
  return agent as DBAgentType;
}

async function updateAgent(args: { id: string; updates: Partial<AgentData> }) {
  const { id, updates } = args;
  const fields = [];
  const values = [];
  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.model !== undefined) {
    fields.push("model = ?");
    values.push(updates.model);
  }
  if (updates.registrationPieceCid !== undefined) {
    fields.push("registration_piece_cid = ?");
    values.push(updates.registrationPieceCid);
  }
  if (updates.baseSystemPrompt !== undefined) {
    fields.push("base_system_prompt = ?");
    values.push(updates.baseSystemPrompt);
  }
  if (updates.knowledgeBases !== undefined) {
    fields.push("knowledge_bases = ?");
    values.push(JSON.stringify(updates.knowledgeBases));
  }
  if (updates.tools !== undefined) {
    fields.push("tools = ?");
    values.push(JSON.stringify(updates.tools));
  }
  if (updates.mcpServers !== undefined) {
    fields.push("mcp_servers = ?");
    values.push(JSON.stringify(updates.mcpServers));
  }
  if (fields.length === 0) return;
  values.push(id);
  const query = `UPDATE agents SET ${fields.join(", ")} WHERE id = ?`;
  await sql.unsafe(query, values);
}

async function deleteAgent(args: { id: string }) {
  const { id } = args;
  await sql`DELETE FROM agents WHERE id = ${id}`;
}

async function getAllAgents(args: {}) {
  const results = await sql`SELECT * FROM agents`;
  return results.map((row: unknown) => {
    const parsedRow = row as AgentRowType;
    const agent = {
      id: String(parsedRow.id),
      name: parsedRow.name,
      description: parsedRow.description,
      model: parsedRow.model,
      registrationPieceCid: parsedRow.registration_piece_cid,
      baseSystemPrompt: parsedRow.base_system_prompt,
      knowledgeBases: JSON.parse(parsedRow.knowledge_bases),
      tools: JSON.parse(parsedRow.tools),
      mcpServers: JSON.parse(parsedRow.mcp_servers),
    };
    return agent as DBAgentType;
  });
}

async function createAgentCard(args: { agentId: string; card: z.infer<typeof AgentCardSchema> }) {
  const validatedArgs = CreateAgentCardSchema.parse(args);
  const { agentId, card } = validatedArgs;
  
  const result = await sql`
    INSERT INTO agent_cards (
      agent_id, human_readable_id, schema_version, agent_version,
      name, description, url, provider, capabilities, auth_schemes,
      skills, tags, icon_url, last_updated
    )
    VALUES (
      ${agentId}, ${card.humanReadableId}, ${card.schemaVersion}, ${card.agentVersion},
      ${card.name}, ${card.description}, ${card.url},
      ${JSON.stringify(card.provider)}, ${JSON.stringify(card.capabilities)},
      ${JSON.stringify(card.authSchemes)}, ${JSON.stringify(card.skills || [])},
      ${JSON.stringify(card.tags || [])}, ${card.iconUrl || null},
      ${card.lastUpdated || new Date().toISOString()}
    )
    RETURNING id
  `;
  return result[0];
}

async function getAgentCard(args: { id?: string; humanReadableId?: string; agentId?: string }) {
  const validatedArgs = GetAgentCardSchema.parse(args);
  const { id, humanReadableId, agentId } = validatedArgs;
  
  let result;
  if (id) {
    result = await sql`SELECT * FROM agent_cards WHERE id = ${id}`;
  } else if (humanReadableId) {
    result = await sql`SELECT * FROM agent_cards WHERE human_readable_id = ${humanReadableId}`;
  } else if (agentId) {
    result = await sql`SELECT * FROM agent_cards WHERE agent_id = ${agentId}`;
  } else {
    return null;
  }
  
  if (result.length === 0) return null;
  
  // Parse the raw row, handling Date objects from database
  const rawRow = result[0];
  const row = {
    ...rawRow,
    last_updated: rawRow.last_updated instanceof Date 
      ? rawRow.last_updated.toISOString() 
      : typeof rawRow.last_updated === 'string' 
        ? rawRow.last_updated 
        : String(rawRow.last_updated),
    created_at: rawRow.created_at instanceof Date 
      ? rawRow.created_at.toISOString() 
      : typeof rawRow.created_at === 'string' 
        ? rawRow.created_at 
        : String(rawRow.created_at),
    updated_at: rawRow.updated_at instanceof Date 
      ? rawRow.updated_at.toISOString() 
      : typeof rawRow.updated_at === 'string' 
        ? rawRow.updated_at 
        : String(rawRow.updated_at),
  };
  
  const parsedRow = RawAgentCardRowSchema.parse(row);
  
  const card = {
    id: String(parsedRow.id),
    agentId: String(parsedRow.agent_id),
    schemaVersion: parsedRow.schema_version,
    humanReadableId: parsedRow.human_readable_id,
    agentVersion: parsedRow.agent_version,
    name: parsedRow.name,
    description: parsedRow.description,
    url: parsedRow.url,
    provider: JSON.parse(parsedRow.provider),
    capabilities: JSON.parse(parsedRow.capabilities),
    authSchemes: JSON.parse(parsedRow.auth_schemes),
    skills: JSON.parse(parsedRow.skills),
    tags: JSON.parse(parsedRow.tags),
    iconUrl: parsedRow.icon_url,
    lastUpdated: parsedRow.last_updated,
    createdAt: parsedRow.created_at,
    updatedAt: parsedRow.updated_at,
  };
  
  const ExtendedAgentCardSchema = AgentCardSchema.extend({
    id: z.string(),
    agentId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
  
  return ExtendedAgentCardSchema.parse(card);
}

async function updateAgentCard(args: { id: string; updates: Partial<z.infer<typeof AgentCardSchema>> }) {
  const validatedArgs = UpdateAgentCardSchema.parse(args);
  const { id, updates } = validatedArgs;
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.schemaVersion !== undefined) {
    fields.push("schema_version = ?");
    values.push(updates.schemaVersion);
  }
  if (updates.humanReadableId !== undefined) {
    fields.push("human_readable_id = ?");
    values.push(updates.humanReadableId);
  }
  if (updates.agentVersion !== undefined) {
    fields.push("agent_version = ?");
    values.push(updates.agentVersion);
  }
  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.url !== undefined) {
    fields.push("url = ?");
    values.push(updates.url);
  }
  if (updates.provider !== undefined) {
    fields.push("provider = ?");
    values.push(JSON.stringify(updates.provider));
  }
  if (updates.capabilities !== undefined) {
    fields.push("capabilities = ?");
    values.push(JSON.stringify(updates.capabilities));
  }
  if (updates.authSchemes !== undefined) {
    fields.push("auth_schemes = ?");
    values.push(JSON.stringify(updates.authSchemes));
  }
  if (updates.skills !== undefined) {
    fields.push("skills = ?");
    values.push(JSON.stringify(updates.skills));
  }
  if (updates.tags !== undefined) {
    fields.push("tags = ?");
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.iconUrl !== undefined) {
    fields.push("icon_url = ?");
    values.push(updates.iconUrl || null);
  }
  if (updates.lastUpdated !== undefined) {
    fields.push("last_updated = ?");
    values.push(updates.lastUpdated);
  }
  
  if (fields.length === 0) return;
  
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  
  const query = `UPDATE agent_cards SET ${fields.join(", ")} WHERE id = ?`;
  await sql.unsafe(query, values);
}

async function deleteAgentCard(args: { id: string }) {
  const validatedArgs = DeleteAgentCardSchema.parse(args);
  const { id } = validatedArgs;
  await sql`DELETE FROM agent_cards WHERE id = ${id}`;
}

export const db = {
    $client: sql,
  insertMessage,
  getChatHistory,
  getChatsByWallet,
  deleteChatHistory,
  deleteChatsByWallet,
  getAllChatIds,
  createChat,
  getChat,
  deleteChat,
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
  getAllAgents,
  createAgentCard,
  getAgentCard,
  updateAgentCard,
  deleteAgentCard,
};
