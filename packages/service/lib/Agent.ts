import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { db } from "../db/client";
import type { AgentDescriptor, IAgent } from "../types/agent";
import { MCPClient } from "./mcpClient";
import { z } from "zod";

export class Agent implements IAgent {
  private groq: ReturnType<typeof createOpenAI>;
  private mcpClient: MCPClient;

  static async fromId({ id }: { id: string }) {
    const agentData = await db.getAgent({ id });

    if (!agentData) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    const registration: AgentDescriptor["registration"] | null = null;
    if (!registration) {
      throw new Error(`Registration for agent ${agentData.id} not found`);
    }
    const agentDescriptor: AgentDescriptor = {
      id: agentData.id,
      registrationPieceCid: agentData.registrationPieceCid,
      registration: registration,
      baseSystemPrompt: agentData.baseSystemPrompt,
      knowledgeBases: agentData.knowledgeBases || [],
      tools: agentData.tools || [],
      mcpServers: (agentData.mcpServers || []) as AgentDescriptor["mcpServers"],
    };

    return new Agent(agentDescriptor);
  }

  protected constructor(private agentDescriptor: AgentDescriptor) {
    this.groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });
    this.mcpClient = new MCPClient();
  }

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;

    // Connect to MCP servers if available
    if (
      this.agentDescriptor?.mcpServers &&
      this.agentDescriptor.mcpServers.length > 0
    ) {
      await this.mcpClient.connectToServers(this.agentDescriptor.mcpServers);
    }

    // Build system prompt from chat info
    let systemPrompt = "";
    if (this.agentDescriptor) {
      systemPrompt = this.agentDescriptor.baseSystemPrompt || "";
    }

    // Build messages array for Groq API
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    // Add system message if we have a system prompt
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    // Load chat history from database
    if (chatId) {
      try {
        const history = await db.getChatHistory({ chatId });
        for (const msg of history) {
          if (msg.role === "user" || msg.role === "human") {
            messages.push({ role: "user", content: msg.content });
          } else if (msg.role === "assistant" || msg.role === "ai") {
            messages.push({ role: "assistant", content: msg.content });
          } else if (msg.role === "system") {
            // System messages from history (if any)
            messages.push({ role: "system", content: msg.content });
          }
        }
      } catch (error) {
        console.warn(`Failed to load chat history for ${chatId}:`, error);
      }
    }

    // Add the current user message
    messages.push({ role: "user", content: message });

    // Get available MCP tools
    const mcpTools = await this.mcpClient.getAvailableTools();
    const tools: Record<string, any> = {};

    for (const mcpTool of mcpTools) {
      const mcpToolName = mcpTool.name;
      tools[mcpToolName] = {
        description: mcpTool.description,
        parameters: z.object(mcpTool.inputSchema.properties || {}),
        execute: async (args: any) => {
          return await this.mcpClient.callTool(mcpToolName, args);
        },
      };
    }

    // Generate response using AI SDK with tools
    const { text } = await generateText({
      model: this.groq("llama-3.3-70b-versatile"),
      messages: messages,
      temperature: 0.7,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
    });

    // Disconnect from MCP servers after generation
    await this.mcpClient.disconnect();

    return text;
  }
}
