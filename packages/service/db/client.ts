import { SQL } from "bun";

const sql = new SQL("");

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

export const db = {
    insertMessage,
    getChatHistory,
    getChatsByWallet,
    deleteChatHistory,
    deleteChatsByWallet,
    getAllChatIds,
};
