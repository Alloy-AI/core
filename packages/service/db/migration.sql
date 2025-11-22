CREATE TABLE
    IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_chat_id ON chat_history (chat_id);

CREATE INDEX IF NOT EXISTS idx_wallet_address ON chat_history (wallet_address);

CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_history (timestamp);
