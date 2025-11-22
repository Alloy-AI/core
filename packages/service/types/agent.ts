import type { Address } from "viem";

export interface IAgent {
  generateResponse(args: { message: string; chatId?: string }): Promise<string>;
}

export type AgentDescriptor = {
  id: string;

  model: string;

  registrationPieceCid: string;
  registration: {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1";
    name: string;
    description: string;
    image?: string;
    endpoints: RegistrationEndpoint[];
    registrations: ERC8004Registration[];
    supportedTrust: string[];
  };

  baseSystemPrompt: string;

  knowledgeBases: {
    id: string;
    name: string;
    description: string;
    pieceCid: string;
    enabled: boolean;
  }[];

  tools: {
    id: string;
    name: string;
    kind: "builtin" | "mcp";
    ref: string;
    enabled: boolean;
    config?: Record<string, unknown>;
  }[];

  mcpServers: {
    id: string;
    name: string;
    transport: "stdio" | "websocket" | "custom";
    connectionInfo: MCPConnectionInfo;
    enabled: boolean;
  }[];
};

type EIP155Address = `eip155:${number}:${Address}`;

type ERC8004Registration = {
  agentId: number;
  agentRegistry: EIP155Address;
};

type RegistrationEndpoint =
  | {
      name: "A2A";
      endpoint: string;
      version?: "0.3.0";
    }
  | {
      name: "agentWallet";
      endpoint: EIP155Address;
    }
  | {
      name: "operatorWallet";
      endpoint: EIP155Address;
    }
  | {
      name: "ENS";
      endpoint: string;
    };

type MCPConnectionInfo =
  | MCPWebSocketConnection
  | MCPHttpConnection
  | MCPCustomConnection;

type MCPWebSocketConnection = {
  url: string;
  headers?: Record<string, string>;
};

/// I would consider removing streams depending upon how difficult they are to implement, for now aassume no streaming and awaiting the entire resposne
type MCPHttpConnection = {
  url: string;
  streaming?: boolean;
  headers?: Record<string, string>;
  protocol?: "http" | "sse" | "streamable_http";
};

type MCPCustomConnection = {
  [key: string]: unknown; // your own schema
};
