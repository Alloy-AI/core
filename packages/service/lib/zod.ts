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
  model: z.string(),
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
  registrationPieceCid: true,
}).extend({
  name: z.string().optional(),
  description: z.string().optional(),
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
  model: z.string(),
  registration_piece_cid: z.string(),
  base_system_prompt: z.string(),
  knowledge_bases: z.string(), // JSON string
  tools: z.string(), // JSON string
  mcp_servers: z.string(), // JSON string
});

export const DBAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  model: z.string(),
  registrationPieceCid: z.string(),
  baseSystemPrompt: z.string(),
  knowledgeBases: z.array(KnowledgeBaseSchema),
  tools: z.array(ToolSchema),
  mcpServers: z.array(MCPServerSchema),
});

// A2A AgentCard Schemas
export const AuthSchemeSchema = z.object({
  scheme: z.literal("none"),
});

export const ProviderSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  support_contact: z.string().optional(),
});

export const TEEDetailsSchema = z.object({
  type: z.string(),
  attestationEndpoint: z.string().url().optional(),
  publicKey: z.string().optional(),
  description: z.string().optional(),
});

export const CapabilitiesSchema = z.object({
  a2aVersion: z.string(),
  mcpVersion: z.string().optional(),
  supportedMessageParts: z.array(z.string()).optional(),
  supportsPushNotifications: z.boolean().optional(),
  supportsAuthenticatedExtendedCard: z.boolean().optional(),
  teeDetails: TEEDetailsSchema.optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  input_schema: z.record(z.string(), z.any()).optional(),
  output_schema: z.record(z.string(), z.any()).optional(),
});

export const AgentCardSchema = z.object({
  schemaVersion: z.string(),
  humanReadableId: z.string(),
  agentVersion: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  provider: ProviderSchema,
  capabilities: CapabilitiesSchema,
  authSchemes: z.array(AuthSchemeSchema).min(1),
  skills: z.array(SkillSchema).optional(),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional(),
  lastUpdated: z.string().optional(),
});

export const CreateAgentCardSchema = z.object({
  agentId: z.string(),
  card: AgentCardSchema,
});

export const GetAgentCardSchema = z.object({
  id: z.string().optional(),
  humanReadableId: z.string().optional(),
  agentId: z.string().optional(),
});

export const UpdateAgentCardSchema = z.object({
  id: z.string(),
  updates: AgentCardSchema.partial(),
});

export const DeleteAgentCardSchema = z.object({
  id: z.string(),
});

export const RawAgentCardRowSchema = z.object({
  id: z.number(),
  agent_id: z.number(),
  human_readable_id: z.string(),
  schema_version: z.string(),
  agent_version: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  provider: z.string(), // JSON string
  capabilities: z.string(), // JSON string
  auth_schemes: z.string(), // JSON string
  skills: z.string(), // JSON string
  tags: z.string(), // JSON string
  icon_url: z.string().nullable(),
  last_updated: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
