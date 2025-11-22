import { z } from "zod";
import { SQL } from "bun";
import type { AgentDescriptor } from "../types/agent";
import { decryptSelf, encryptSelf } from "../lib/crypto";
import {
    InsertMessageSchema,
    GetChatHistorySchema,
    ChatHistoryRowSchema,
    GetChatsByWalletSchema,
    DeleteChatHistorySchema,
    DeleteChatsByWalletSchema,
    GetAllChatIdsSchema,
    CreateAgentSchema,
    GetAgentSchema,
    UpdateAgentSchema,
    DeleteAgentSchema,
    GetAllAgentsSchema,
    RawAgentRowSchema,
    DBAgentSchema,
    RawChatHistoryRowSchema,
} from "../lib/zod";

const sql = new SQL("");

type AgentData = Omit<AgentDescriptor, "registration" | "id">;

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
    registration_piece_cid: string;
    base_system_prompt: string;
    knowledge_bases: string;
    tools: string;
    mcp_servers: string;
}

async function insertMessage(args: { chatId: string, walletAddress: string, role: string, content: string }) {
    const validatedArgs = InsertMessageSchema.parse(args);
    const { chatId, walletAddress, role, content } = validatedArgs;

    const encryptedContent = await encryptSelf({ message: content });

    const result = await sql`
        INSERT INTO chat_history (chat_id, wallet_address, role, content)
        VALUES (${chatId}, ${walletAddress}, ${role}, ${encryptedContent})
        RETURNING id
    `;
    return result[0];
}

async function getChatHistory(args: { chatId: string }) {
    const validatedArgs = GetChatHistorySchema.parse(args);
    const { chatId } = validatedArgs;
    const results = await sql`
        SELECT * FROM chat_history
        WHERE chat_id = ${chatId}
        ORDER BY timestamp ASC
    `;

    return results.map((row: unknown) => {
        const rawRow = RawChatHistoryRowSchema.parse(row);
        const decryptedRow = {
            ...rawRow,
            content: decryptSelf({ ciphertext: rawRow.content })
        };
        return ChatHistoryRowSchema.parse(decryptedRow);
    });
}

async function getChatsByWallet(args: { walletAddress: string }) {
    const validatedArgs = GetChatsByWalletSchema.parse(args);
    const { walletAddress } = validatedArgs;
    const results = await sql`
        SELECT DISTINCT chat_id FROM chat_history
        WHERE wallet_address = ${walletAddress}
    `;

    return results.map((row: unknown) => {
        const parsed = z.object({ chat_id: z.string() }).parse(row);
        return parsed.chat_id;
    });
}

async function deleteChatHistory(args: { chatId: string }) {
    const validatedArgs = DeleteChatHistorySchema.parse(args);
    const { chatId } = validatedArgs;
    await sql`DELETE FROM chat_history WHERE chat_id = ${chatId}`;
}

async function deleteChatsByWallet(args: { walletAddress: string }) {
    const validatedArgs = DeleteChatsByWalletSchema.parse(args);
    const { walletAddress } = validatedArgs;
    await sql`DELETE FROM chat_history WHERE wallet_address = ${walletAddress}`;
}

async function getAllChatIds(args: {}) {
    const validatedArgs = GetAllChatIdsSchema.parse(args);
    const results = await sql`SELECT DISTINCT chat_id FROM chat_history`;
    return results.map((row: unknown) => {
        const parsed = z.object({ chat_id: z.string() }).parse(row);
        return parsed.chat_id;
    });
}

async function createAgent(args: { agentData: AgentData }) {
    const validatedArgs = CreateAgentSchema.parse(args);
    const { agentData } = validatedArgs;
    const result = await sql`
        INSERT INTO agents (registration_piece_cid, base_system_prompt, knowledge_bases, tools, mcp_servers)
        VALUES (${agentData.registrationPieceCid}, ${agentData.baseSystemPrompt}, ${JSON.stringify(agentData.knowledgeBases)}, ${JSON.stringify(agentData.tools)}, ${JSON.stringify(agentData.mcpServers)})
        RETURNING id
    `;
    return result[0];
}

async function getAgent(args: { id: string }) {
    const validatedArgs = GetAgentSchema.parse(args);
    const { id } = validatedArgs;
    const result = await sql`
        SELECT * FROM agents WHERE id = ${id}
    `;
    if (result.length === 0) return null;
    const row = RawAgentRowSchema.parse(result[0]);
    const agent = {
        id: String(row.id),
        registrationPieceCid: row.registration_piece_cid,
        baseSystemPrompt: row.base_system_prompt,
        knowledgeBases: JSON.parse(row.knowledge_bases),
        tools: JSON.parse(row.tools),
        mcpServers: JSON.parse(row.mcp_servers),
    };
    return DBAgentSchema.parse(agent);
}

async function updateAgent(args: { id: string, updates: Partial<AgentData> }) {
    const validatedArgs = UpdateAgentSchema.parse(args);
    const { id, updates } = validatedArgs;
    const fields = [];
    const values = [];
    if (updates.registrationPieceCid !== undefined) {
        fields.push('registration_piece_cid = ?');
        values.push(updates.registrationPieceCid);
    }
    if (updates.baseSystemPrompt !== undefined) {
        fields.push('base_system_prompt = ?');
        values.push(updates.baseSystemPrompt);
    }
    if (updates.knowledgeBases !== undefined) {
        fields.push('knowledge_bases = ?');
        values.push(JSON.stringify(updates.knowledgeBases));
    }
    if (updates.tools !== undefined) {
        fields.push('tools = ?');
        values.push(JSON.stringify(updates.tools));
    }
    if (updates.mcpServers !== undefined) {
        fields.push('mcp_servers = ?');
        values.push(JSON.stringify(updates.mcpServers));
    }
    if (fields.length === 0) return;
    values.push(id);
    const query = `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`;
    await sql.unsafe(query, values);
}

async function deleteAgent(args: { id: string }) {
    const validatedArgs = DeleteAgentSchema.parse(args);
    const { id } = validatedArgs;
    await sql`DELETE FROM agents WHERE id = ${id}`;
}

async function getAllAgents(args: {}) {
    const validatedArgs = GetAllAgentsSchema.parse(args);
    const results = await sql`SELECT * FROM agents`;
    return results.map((row: unknown) => {
        const parsedRow = RawAgentRowSchema.parse(row);
        const agent = {
            id: String(parsedRow.id),
            registrationPieceCid: parsedRow.registration_piece_cid,
            baseSystemPrompt: parsedRow.base_system_prompt,
            knowledgeBases: JSON.parse(parsedRow.knowledge_bases),
            tools: JSON.parse(parsedRow.tools),
            mcpServers: JSON.parse(parsedRow.mcp_servers),
        };
        return DBAgentSchema.parse(agent);
    });
}

export const db = {
    insertMessage,
    getChatHistory,
    getChatsByWallet,
    deleteChatHistory,
    deleteChatsByWallet,
    getAllChatIds,
    createAgent,
    getAgent,
    updateAgent,
    deleteAgent,
    getAllAgents,
};
