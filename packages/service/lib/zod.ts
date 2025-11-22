import { z } from "zod";

// Chat History Schemas
export const InsertMessageSchema = z.object({
  chatId: z.string(),
  role: z.string(),
  content: z.string(),
});

export const GetChatHistorySchema = z.object({
  chatId: z.string(),
});

export const ChatHistoryRowSchema = z.object({
  id: z.number(),
  chat_id: z.string(),
  wallet_address: z.string(),
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export const GetChatsByWalletSchema = z.object({
  walletAddress: z.string(),
});

export const GetChatsOfWalletAddressSchema = z.object({
  walletAddress: z.string(),
});

export const DeleteChatHistorySchema = z.object({
  chatId: z.string(),
});

export const DeleteChatsByWalletSchema = z.object({
  walletAddress: z.string(),
});

const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

const EIP155AddressSchema = z.string().regex(/^eip155:\d+:0x[a-fA-F0-9]{40}$/);

const ERC8004RegistrationSchema = z.object({
  agentId: z.number(),
  agentRegistry: EIP155AddressSchema,
});

const RegistrationEndpointSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("A2A"),
    endpoint: z.string(),
    version: z.string().optional(),
  }),
  z.object({
    name: z.literal("agentWallet"),
    endpoint: EIP155AddressSchema,
  }),
  z.object({
    name: z.literal("operatorWallet"),
    endpoint: EIP155AddressSchema,
  }),
  z.object({
    name: z.literal("ENS"),
    endpoint: z.string(),
  }),
]);

const KnowledgeBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  pieceCid: z.string(),
  enabled: z.boolean(),
});

const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["builtin", "mcp"]),
  ref: z.string(),
  enabled: z.boolean(),
  config: z.record(z.string(), z.any()).optional(),
});

const MCPConnectionInfoSchema = z.union([
  z.object({
    url: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    url: z.string(),
    streaming: z.boolean().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    protocol: z.enum(["http", "sse", "streamable_http"]).optional(),
  }),
  z.record(z.string(), z.any()),
]);

const MCPServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  transport: z.enum(["stdio", "websocket", "custom"]),
  connectionInfo: MCPConnectionInfoSchema,
  enabled: z.boolean(),
});

export const AgentDescriptorSchema = z.object({
  id: z.string(),
  registrationPieceCid: z.string(),
  registration: z.object({
    type: z.literal("https://eips.ethereum.org/EIPS/eip-8004#registration-v1"),
    name: z.string(),
    description: z.string(),
    image: z.string().optional(),
    endpoints: z.array(RegistrationEndpointSchema),
    registrations: z.array(ERC8004RegistrationSchema),
    supportedTrust: z.array(z.string()),
  }),
  baseSystemPrompt: z.string(),
  knowledgeBases: z.array(KnowledgeBaseSchema),
  tools: z.array(ToolSchema),
  mcpServers: z.array(MCPServerSchema),
});

export const AgentDataSchema = AgentDescriptorSchema.omit({
  registration: true,
  id: true,
});

export const CreateAgentSchema = z.object({
  agentData: AgentDataSchema,
});

export const GetAgentSchema = z.object({
  id: z.string(),
});

export const UpdateAgentSchema = z.object({
  id: z.string(),
  updates: AgentDataSchema.partial(),
});

export const DeleteAgentSchema = z.object({
  id: z.string(),
});

export const GetAllAgentsSchema = z.object({});

// Raw database row schemas (before processing)
export const GetAllChatIdsSchema = z.object({});

// Chat Schemas
export const ChatSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  agentId: z.number().nullable(),
  createdAt: z.string(),
});

export const CreateChatSchema = z.object({
  chatId: z.string(),
  walletAddress: z.string(),
  agentId: z.number().optional(),
});

export const GetChatSchema = z.object({
  chatId: z.string(),
});

export const DeleteChatSchema = z.object({
  chatId: z.string(),
});

// Raw database row schemas (before processing)
export const RawChatHistoryRowSchema = z.object({
  id: z.number(),
  chat_id: z.string(),
  role: z.string(),
  content: z.string(), // encrypted
  timestamp: z.string(),
});

export const RawChatRowSchema = z.object({
  id: z.string(),
  wallet_address: z.string(),
  agent_id: z.number().nullable(),
  created_at: z.string(),
});

export const RawAgentRowSchema = z.object({
  id: z.number(),
  registration_piece_cid: z.string(),
  base_system_prompt: z.string(),
  knowledge_bases: z.string(), // JSON string
  tools: z.string(), // JSON string
  mcp_servers: z.string(), // JSON string
});

export const DBAgentSchema = z.object({
  id: z.string(),
  registrationPieceCid: z.string(),
  baseSystemPrompt: z.string(),
  knowledgeBases: z.array(KnowledgeBaseSchema),
  tools: z.array(ToolSchema),
  mcpServers: z.array(MCPServerSchema),
});
