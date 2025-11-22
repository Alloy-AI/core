export interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  version: string;
  created: string;
  extensions: string[]; // Extension IDs
}

export interface Extension {
  id: string;
  name: string;
  category: string;
  description?: string;
  created: string;
  productId?: string;
  creator?: string;
  address?: string;
  enabled: boolean;
}

export const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Trading Bot Alpha",
    isActive: true,
    version: "v1.2.0",
    description: "High-frequency trading algorithm focused on ETH pairs.",
    created: "8/4/2025",
    extensions: ["1"],
  },
  {
    id: "2",
    name: "Support Agent v2",
    isActive: false,
    version: "v2.0.1",
    description: "Customer service bot handling tier 1 support queries.",
    created: "7/20/2025",
    extensions: [],
  },
  {
    id: "3",
    name: "Data Scraper X",
    isActive: true,
    version: "v1.0.0",
    description: "Aggregates market sentiment data from social media.",
    created: "8/1/2025",
    extensions: ["2", "3"],
  },
  {
    id: "4",
    name: "Arbitrage Bot",
    isActive: true,
    version: "v3.1.0",
    description: "Scans DEXs for price discrepancies.",
    created: "6/15/2025",
    extensions: [],
  },
  {
    id: "5",
    name: "Content Gen AI",
    isActive: false,
    version: "v0.9.5",
    description: "Generates daily market analysis reports.",
    created: "8/10/2025",
    extensions: ["1"],
  },
];

export const mockExtensions: Extension[] = [
  {
    id: "1",
    name: "Wikipedia Knowledge Base",
    category: "Text Knowledge",
    description: "Full Wikipedia dump for general knowledge queries.",
    created: "2 days ago",
    productId: "2",
    creator: "0x472c...c418",
    address: "0x98f9...1420",
    enabled: true,
  },
  {
    id: "2",
    name: "Email Parser Tool",
    category: "Tools",
    description: "Parses incoming emails and extracts key information.",
    created: "1 week ago",
    productId: "5",
    creator: "0x1234...5678",
    address: "0xabcd...efgh",
    enabled: false,
  },
  {
    id: "3",
    name: "Crypto Market Sentiment",
    category: "Knowledge",
    description: "Real-time sentiment analysis from Twitter and Reddit.",
    created: "3 days ago",
    productId: "8",
    creator: "0x9abc...def0",
    address: "0x5678...9abc",
    enabled: true,
  },
  {
    id: "4",
    name: "PDF Report Generator",
    category: "Tools",
    description: "Generates professional PDF reports from raw data.",
    created: "5 hours ago",
    productId: "12",
    creator: "0xfedc...ba98",
    address: "0x4321...8765",
    enabled: true,
  },
  {
    id: "5",
    name: "Takopi's Original Sin Anime - Full Trivia",
    category: "Text Knowledge",
    description: "Comprehensive trivia knowledge base for the anime.",
    created: "8/4/2025",
    productId: "2",
    creator: "0x472c...c418",
    address: "0x98f9...1420",
    enabled: true,
  },
];
