CREATE TABLE
    IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        model VARCHAR(255) NOT NULL,
        key_seed VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
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

-- AgentCard table for A2A protocol
CREATE TABLE
    IF NOT EXISTS agent_cards (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        human_readable_id VARCHAR(255) NOT NULL UNIQUE,
        schema_version VARCHAR(50) NOT NULL DEFAULT '1.0',
        agent_version VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        url VARCHAR(500) NOT NULL,
        provider JSONB NOT NULL,
        capabilities JSONB NOT NULL,
        auth_schemes JSONB NOT NULL,
        skills JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '[]'::jsonb,
        icon_url VARCHAR(500),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_agent_cards_agent_id ON agent_cards (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_cards_human_readable_id ON agent_cards (human_readable_id);
