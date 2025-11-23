CREATE TABLE
    IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        registration_piece_cid VARCHAR(255) NOT NULL,
        base_system_prompt TEXT NOT NULL,
        knowledge_bases JSONB DEFAULT '[]'::jsonb,
        tools JSONB DEFAULT '[]'::jsonb,
        mcp_servers JSONB DEFAULT '[]'::jsonb
    );

CREATE INDEX IF NOT EXISTS idx_agents_id ON agents (id);

CREATE TABLE
    IF NOT EXISTS chats (
        id VARCHAR(255) PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        agent_id INTEGER REFERENCES agents(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_chats_wallet_address ON chats (wallet_address);

CREATE INDEX IF NOT EXISTS idx_chats_agent_id ON chats (agent_id);

CREATE TABLE
    IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_chat_id ON chat_history (chat_id);

CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_history (timestamp);
