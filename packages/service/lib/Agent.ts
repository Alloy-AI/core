import { experimental_createMCPClient } from "@ai-sdk/mcp";
import type { AgentDescriptor, IAgent } from "../types/agent";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import db from "../db/client";
import { eq } from "drizzle-orm";
import schema from "../db/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { env } from "../env";
import type { Hex } from "viem";
import { tryCatch } from "./tryCatch";
import { appd } from "./appd";

export class Agent implements IAgent {
  static async fromId({ id }: { id: number }) {
    const [agentData] = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, Number(id)));

    if (!agentData) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    const registration: AgentDescriptor["registration"] | null = null;
    if (!registration) {
      throw new Error(`Registration for agent ${agentData.id} not found`);
    }
    const agentDescriptor: AgentDescriptor = {
      id: agentData.id,
      model: agentData.model,
      keySeed: agentData.keySeed,
      registrationPieceCid: agentData.registrationPieceCid,
      registration: registration,
      baseSystemPrompt: agentData.baseSystemPrompt,
      knowledgeBases: agentData.knowledgeBases,
      tools: agentData.tools,
      mcpServers: (agentData.mcpServers || []) as AgentDescriptor["mcpServers"],
    };

    const agentPvtKeyResult = await tryCatch(
      appd.getEvmSecretKey(agentData.keySeed),
    );
    if (agentPvtKeyResult.error) {
      throw new Error(
        `Failed to get agent private key: ${agentPvtKeyResult.error}`,
      );
    }
    const agentPvtKey = agentPvtKeyResult.data;

    return new Agent(agentDescriptor, agentPvtKey);
  }

  protected constructor(
    private agentDescriptor: AgentDescriptor,
    private privateKey: Hex,
  ) {}

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    if (this.agentDescriptor.baseSystemPrompt) {
      messages.push({
        role: "system",
        content: this.agentDescriptor.baseSystemPrompt,
      });
    }

    if (chatId) {
      try {
        const history = await db
          .select()
          .from(schema.chatHistory)
          .where(eq(schema.chatHistory.chatId, chatId));
        for (const msg of history) {
          if (msg.role === "user" || msg.role === "human") {
            messages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant" || msg.role === "ai") {
            messages.push({ role: "assistant", content: msg.content });
          } else if (msg.role === "system") {
            messages.push({ role: "system", content: msg.content });
          }
        }
      } catch (error) {
        console.warn(`Failed to load chat history for ${chatId}:`, error);
      }
    }

    messages.push({ role: "user", content: message });

    const evmMcpClient = await experimental_createMCPClient({
      transport: new StreamableHTTPClientTransport(
        new URL(env.EVM_MCP_SERVER_URL),
        {
          requestInit: {
            headers: { Authorization: `Bearer ${this.privateKey}` },
          },
        },
      ),
    });
    const tools = await evmMcpClient.tools();

    for (const mcp of this.agentDescriptor.mcpServers) {
      const mcpClient = await experimental_createMCPClient({
        transport: new StreamableHTTPClientTransport(new URL(mcp.url), {
          requestInit: { headers: mcp.authHeaders },
        }),
      });
      const mcpTools = await mcpClient.tools();
      Object.assign(tools, mcpTools);
    }

    const llm = createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    const { text } = await generateText({
      model: llm(this.agentDescriptor.model),
      messages: messages,
      temperature: 0.7,
      tools: tools,
    });

    // await this.mcpClient.disconnect();

    return text;
  }
}
