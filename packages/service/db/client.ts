import { SQL } from "bun";
import type { AgentDescriptor } from "../types/agent";

const sql = new SQL("");

type AgentData = Omit<AgentDescriptor, "registration" | "id">;

async function insertMessage(args: { chatId: string, walletAddress: string, role: string, content: string }) {
    const { chatId, walletAddress, role, content } = args;
    const result = await sql`
        INSERT INTO chat_history (chat_id, wallet_address, role, content)
        VALUES (${chatId}, ${walletAddress}, ${role}, ${content})
        RETURNING id
    `;
    return result[0];
}

async function getChatHistory(args: { chatId: string }) {
    const { chatId } = args;
    const results = await sql`
        SELECT * FROM chat_history
        WHERE chat_id = ${chatId}
        ORDER BY timestamp ASC
    `;
    return results;
}

async function getChatsByWallet(args: { walletAddress: string }) {
    const { walletAddress } = args;
    const results = await sql`
        SELECT DISTINCT chat_id FROM chat_history
        WHERE wallet_address = ${walletAddress}
    `;
    return results.map((row: any) => row.chat_id);
}

async function deleteChatHistory(args: { chatId: string }) {
    const { chatId } = args;
    await sql`DELETE FROM chat_history WHERE chat_id = ${chatId}`;
}

async function deleteChatsByWallet(args: { walletAddress: string }) {
    const { walletAddress } = args;
    await sql`DELETE FROM chat_history WHERE wallet_address = ${walletAddress}`;
}

async function getAllChatIds(args: {}) {
    const {} = args;
    const results = await sql`SELECT DISTINCT chat_id FROM chat_history`;
    return results.map((row: any) => row.chat_id);
}

async function createAgent(args: { agentData: AgentData }) {
    const { agentData } = args;
    const result = await sql`
        INSERT INTO agents (registration_piece_cid, base_system_prompt, knowledge_bases, tools, mcp_servers)
        VALUES (${agentData.registrationPieceCid}, ${agentData.baseSystemPrompt}, ${JSON.stringify(agentData.knowledgeBases)}, ${JSON.stringify(agentData.tools)}, ${JSON.stringify(agentData.mcpServers)})
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
    const row = result[0];
    return {
        id: String(row.id),
        registrationPieceCid: row.registration_piece_cid,
        baseSystemPrompt: row.base_system_prompt,
        knowledgeBases: JSON.parse(row.knowledge_bases),
        tools: JSON.parse(row.tools),
        mcpServers: JSON.parse(row.mcp_servers),
    };
}

async function updateAgent(args: { id: string, updates: Partial<AgentData> }) {
    const { id, updates } = args;
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
    const { id } = args;
    await sql`DELETE FROM agents WHERE id = ${id}`;
}

async function getAllAgents(args: {}) {
    const {} = args;
    const results = await sql`SELECT * FROM agents`;
    return results.map((row: any) => ({
        id: String(row.id),
        registrationPieceCid: row.registration_piece_cid,
        baseSystemPrompt: row.base_system_prompt,
        knowledgeBases: JSON.parse(row.knowledge_bases),
        tools: JSON.parse(row.tools),
        mcpServers: JSON.parse(row.mcp_servers),
    }));
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
