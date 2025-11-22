import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { AgentDescriptor } from "../types/agent";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class MCPClient {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, SSEClientTransport> = new Map();

  async connectToServers(mcpServers: AgentDescriptor["mcpServers"]) {
    for (const server of mcpServers) {
      if (!server.enabled) continue;

      try {
        // Currently only supporting HTTP/SSE transport
        if (server.transport === "custom") {
          const connectionInfo = server.connectionInfo as {
            url: string;
            headers?: Record<string, string>;
            protocol?: "http" | "sse" | "streamable_http";
          };

          if (!connectionInfo.url) {
            console.warn(
              `MCP server ${server.name} has no URL in connectionInfo`,
            );
            continue;
          }

          const transport = new SSEClientTransport(
            new URL(connectionInfo.url),
            connectionInfo.headers,
          );

          const client = new Client(
            {
              name: "alloy-agent-client",
              version: "1.0.0",
            },
            {
              capabilities: {},
            },
          );

          await client.connect(transport);
          this.clients.set(server.id, client);
          this.transports.set(server.id, transport);

          console.log(`Connected to MCP server: ${server.name}`);
        }
      } catch (error) {
        console.error(`Failed to connect to MCP server ${server.name}:`, error);
      }
    }
  }

  async getAvailableTools(): Promise<MCPTool[]> {
    const allTools: MCPTool[] = [];

    for (const [serverId, client] of Array.from(this.clients.entries())) {
      try {
        const toolsResponse = await client.listTools();

        for (const tool of toolsResponse.tools) {
          allTools.push({
            name: `${serverId}:${tool.name}`,
            description: tool.description || "",
            inputSchema: tool.inputSchema,
          });
        }
      } catch (error) {
        console.error(`Failed to list tools from server ${serverId}:`, error);
      }
    }

    return allTools;
  }

  async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    // Tool name format: serverId:toolName
    const [serverId, actualToolName] = toolName.split(":", 2);

    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`MCP server ${serverId} not connected`);
    }

    try {
      const result = await client.callTool({
        name: actualToolName,
        arguments: args,
      });

      return result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error);
      throw error;
    }
  }

  async disconnect() {
    for (const [serverId, client] of Array.from(this.clients.entries())) {
      try {
        await client.close();
        const transport = this.transports.get(serverId);
        if (transport) {
          await transport.close();
        }
      } catch (error) {
        console.error(`Error disconnecting from server ${serverId}:`, error);
      }
    }

    this.clients.clear();
    this.transports.clear();
  }
}
