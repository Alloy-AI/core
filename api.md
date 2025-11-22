# API Implementation Status

Legend:
- ✅ **Implemented**: Route exists and is connected to DB/Logic.
- ⚠️ **Partial/Stub**: Route exists but is mocked/incomplete or schema needs update.
- 🛠️ **DB Ready**: Database function exists, but route is missing.
- ❌ **Missing**: No Database function or Route logic.

## ✅ Implemented
### Tools & Extensions
- `POST /api/tools/:agentId`: Add tool to agent.
- `DELETE /api/tools/:agentId/:toolId`: Remove tool from agent.
- `PATCH /api/tools/:agentId/:toolId/toggle`: Enable/disable tool.

### A2A Protocol (Agent-to-Agent)
- `GET /api/app-id`: Get Application ID.
- `GET /api/agents/:id/.well-known/a2a.json`: Agent capabilities discovery.

## ⚠️ Partial/Stub
### Agents
- `POST /api/agents`: Create a new agent. (Route: Stub, DB: `createAgent` exists)
- `PATCH /api/agents/:id`: Update agent details. (Route: `PUT /base-system-prompt` only)

### Chat & Conversations
- `POST /api/chats`: Start a new conversation. (Route: Stub, DB: `createChat` exists)

### A2A Protocol (Agent-to-Agent)
- `GET /api/agents/:id/pk`: Get Agent Public Key. (Stub)
- `POST /api/a2a/rpc`: Agent JSON-RPC endpoint (handshake/execute). (Skeleton only)

## 🛠️ DB Ready
### Agents
- `GET /api/agents`: List all agents. (DB: `getAllAgents`)
- `GET /api/agents/:id`: Get agent details. (DB: `getAgent`)
- `DELETE /api/agents/:id`: Delete an agent. (DB: `deleteAgent`)

### Chat & Conversations
- `GET /api/chats`: List conversations. (DB: `getChatsByWallet`)
- `GET /api/chats/:id/messages`: Get message history. (DB: `getChatHistory`)
- `POST /api/chats/:id/messages`: Send a message. (DB: `insertMessage` exists, AI logic missing)

## ❌ Missing
### Tools & Extensions
- `GET /api/extensions`: List all available extensions/tools (Marketplace).
- `POST /api/extensions`: Publish a new extension.

### AI Inference
- `POST /api/chat/completions`: Generate AI response (OpenAI compatible).
- `GET /api/agents/:id/price`: Get price per call.

### Organization & Billing
- `GET /api/organizations/:id/balance`: Get organization balance.
- `GET /api/organizations/:id/models`: List enabled models.
- `POST /api/organizations/:id/fund`: Fund organization.

### Integrations
- `GET /api/agents/:id/integrations`: Get integration status.
- `POST /api/agents/:id/integrations/:type`: Configure integration (telegram/discord).
