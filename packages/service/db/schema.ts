import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const agents = pgTable(
  "agents",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    model: varchar("model", { length: 255 }).notNull(),
    keySeed: varchar("key_seed", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    registrationPieceCid: varchar("registration_piece_cid", {
      length: 255,
    }).notNull(),
    ens: varchar("ens", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    baseSystemPrompt: text("base_system_prompt").notNull(),
    knowledgeBases: jsonb("knowledge_bases").$defaultFn(() => []),
    tools: jsonb("tools").$defaultFn(() => []),
  },
  (table) => ({
    idIdx: index("idx_agents_id").on(table.id),
  }),
);

export const knowledges = pgTable(
  "knowledges",
  {
    id: serial("id").primaryKey(),
    walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    pieceCid: varchar("piece_cid", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    walletAddressIdx: index("idx_knowledges_wallet_address").on(
      table.walletAddress,
    ),
  }),
);

export const agentKnowledge = pgTable(
  "agent_knowledge",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    knowledgeId: integer("knowledge_id")
      .notNull()
      .references(() => knowledges.id, { onDelete: "cascade" }),
  },
  (table) => ({
    agentIdIdx: index("idx_agent_knowledge_agent_id").on(table.agentId),
    knowledgeIdIdx: index("idx_agent_knowledge_knowledge_id").on(
      table.knowledgeId,
    ),
  }),
);

export const chats = pgTable(
  "chats",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
    agentId: integer("agent_id").references(() => agents.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    walletAddressIdx: index("idx_chats_wallet_address").on(table.walletAddress),
    agentIdIdx: index("idx_chats_agent_id").on(table.agentId),
  }),
);

export const chatHistory = pgTable(
  "chat_history",
  {
    id: serial("id").primaryKey(),
    chatId: varchar("chat_id", { length: 255 })
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(),
    content: text("content").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => ({
    chatIdIdx: index("idx_chat_id").on(table.chatId),
    timestampIdx: index("idx_timestamp").on(table.timestamp),
  }),
);

export const agentCards = pgTable(
  "agent_cards",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    humanReadableId: varchar("human_readable_id", { length: 255 })
      .notNull()
      .unique(),
    schemaVersion: varchar("schema_version", { length: 50 })
      .notNull()
      .default("1.0"),
    agentVersion: varchar("agent_version", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    provider: jsonb("provider").notNull(),
    capabilities: jsonb("capabilities").notNull(),
    authSchemes: jsonb("auth_schemes").notNull(),
    skills: jsonb("skills").$defaultFn(() => []),
    tags: jsonb("tags").$defaultFn(() => []),
    iconUrl: varchar("icon_url", { length: 500 }),
    lastUpdated: timestamp("last_updated").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    agentIdIdx: index("idx_agent_cards_agent_id").on(table.agentId),
    humanReadableIdIdx: index("idx_agent_cards_human_readable_id").on(
      table.humanReadableId,
    ),
  }),
);

export const mcpServers = pgTable(
  "mcp_servers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    idIdx: index("idx_mcp_servers_id").on(table.id),
  }),
);

export const selectedMcp = pgTable(
  "selected_mcp",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    mcpId: integer("mcp_id")
      .notNull()
      .references(() => mcpServers.id, { onDelete: "cascade" }),
    authToken: text("auth_token"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    agentIdIdx: index("idx_selected_mcp_agent_id").on(table.agentId),
    mcpIdIdx: index("idx_selected_mcp_mcp_id").on(table.mcpId),
    isActiveIdx: index("idx_selected_mcp_is_active").on(table.isActive),
    uniqueAgentMcp: unique().on(table.agentId, table.mcpId),
  }),
);

const schema = {
  agents,
  knowledges,
  agentKnowledge,
  chats,
  chatHistory,
  agentCards,
  mcpServers,
  selectedMcp,
};

export default schema;
