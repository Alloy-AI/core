import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import { db } from "../db/client";
import type { AgentDescriptor, IAgent } from "../types/agent";
import { MCPClient } from "./mcpClient";

export class Agent implements IAgent {
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
      model: agentData.model,
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
    this.mcpClient = new MCPClient();
  }

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;


    if (
      this.agentDescriptor?.mcpServers &&
      this.agentDescriptor.mcpServers.length > 0
    ) {
      await this.mcpClient.connectToServers(this.agentDescriptor.mcpServers);
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
        const history = await db.getChatHistory({ chatId });
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

    const llm = createOpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    })

    const { text } = await generateText({
      model: llm("llama-3.3-70b-versatile"),
      messages: messages,
      temperature: 0.7,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
    });


    await this.mcpClient.disconnect();

    return text;
  }
}
