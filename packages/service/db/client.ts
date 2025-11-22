import { SQL } from "bun";
import type { AgentDescriptor } from "../types/agent";

const sql = new SQL("");

type AgentData = Omit<AgentDescriptor, "registration">;

async function insertMessage(chatId: string, walletAddress: string, role: string, content: string) {
    const result = await sql`
        INSERT INTO chat_history (chat_id, wallet_address, role, content)
        VALUES (${chatId}, ${walletAddress}, ${role}, ${content})
        RETURNING id
    `;
    return result[0];
}

async function getChatHistory(chatId: string) {
    const results = await sql`
        SELECT * FROM chat_history
        WHERE chat_id = ${chatId}
        ORDER BY timestamp ASC
    `;
    return results;
}

async function getChatsByWallet(walletAddress: string) {
    const results = await sql`
        SELECT DISTINCT chat_id FROM chat_history
        WHERE wallet_address = ${walletAddress}
    `;
    return results.map((row: any) => row.chat_id);
}

async function deleteChatHistory(chatId: string) {
    await sql`DELETE FROM chat_history WHERE chat_id = ${chatId}`;
}

async function deleteChatsByWallet(walletAddress: string) {
    await sql`DELETE FROM chat_history WHERE wallet_address = ${walletAddress}`;
}

async function getAllChatIds() {
    const results = await sql`SELECT DISTINCT chat_id FROM chat_history`;
    return results.map((row: any) => row.chat_id);
}

async function createAgent(agentData: AgentData) {
    const result = await sql`
        INSERT INTO agents (id, registration_piece_cid, base_system_prompt, knowledge_bases, tools, mcp_servers)
        VALUES (${agentData.id}, ${agentData.registrationPieceCid}, ${agentData.baseSystemPrompt}, ${JSON.stringify(agentData.knowledgeBases)}, ${JSON.stringify(agentData.tools)}, ${JSON.stringify(agentData.mcpServers)})
        RETURNING id
    `;
    return result[0];
}

async function getAgent(id: string) {
    const result = await sql`
        SELECT * FROM agents WHERE id = ${id}
    `;
    if (result.length === 0) return null;
    const row = result[0];
    return {
        id: row.id,
        registrationPieceCid: row.registration_piece_cid,
        baseSystemPrompt: row.base_system_prompt,
        knowledgeBases: JSON.parse(row.knowledge_bases),
        tools: JSON.parse(row.tools),
        mcpServers: JSON.parse(row.mcp_servers),
    };
}

async function updateAgent(id: string, updates: Partial<AgentData>) {
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

async function deleteAgent(id: string) {
    await sql`DELETE FROM agents WHERE id = ${id}`;
}

async function getAllAgents() {
    const results = await sql`SELECT * FROM agents`;
    return results.map((row: any) => ({
        id: row.id,
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
