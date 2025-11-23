import { experimental_createMCPClient } from "@ai-sdk/mcp";
import type { AgentDescriptor, IAgent } from "../types/agent";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getAgent, getChatHistory } from "../db/client";

export class Agent implements IAgent {
  static async fromId({ id }: { id: string }) {
    const agentData = await getAgent({ id });

    if (!agentData) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    const registration: AgentDescriptor["registration"] | null = null;
    if (!registration) {
      throw new Error(`Registration for agent ${agentData.id} not found`);
    }
    const agentDescriptor: AgentDescriptor = {
      id: String(agentData.id),
      model: agentData.model,
      keySeed: agentData.keySeed,
      registrationPieceCid: agentData.registrationPieceCid,
      registration: registration,
      baseSystemPrompt: agentData.baseSystemPrompt,
      knowledgeBases: (Array.isArray(agentData.knowledgeBases)
        ? agentData.knowledgeBases
        : []) as AgentDescriptor["knowledgeBases"],
      tools: (Array.isArray(agentData.tools)
        ? agentData.tools
        : []) as AgentDescriptor["tools"],
      mcpServers: (agentData.mcpServers || []) as AgentDescriptor["mcpServers"],
    };

    return new Agent(agentDescriptor);
  }

  protected constructor(private agentDescriptor: AgentDescriptor) {}

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;

    if (
      this.agentDescriptor?.mcpServers &&
      this.agentDescriptor.mcpServers.length > 0
    ) {
    }

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
        const history = await getChatHistory({ chatId });
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

    const tools: ToolSet = {};
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
