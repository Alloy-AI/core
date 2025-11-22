import Groq from "groq-sdk";
import { db } from "../db/client";
import type { AgentDescriptor, IAgent } from "../types/agent";

export class Agent implements IAgent {
  private groqClient: Groq;

  constructor() {
    this.groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;

    // Get chat information if chatId is provided
    let chatInfo: AgentDescriptor | undefined;
    if (chatId) {
      try {
        chatInfo = await this.getChatInformation({ chatId });
      } catch (error) {
        console.warn(
          `Chat with ID ${chatId} not found, proceeding without chat context`,
        );
      }
    }

    // Build system prompt from chat info
    let systemPrompt = "";
    if (chatInfo) {
      systemPrompt = chatInfo.baseSystemPrompt || "";
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

    // Generate response using Groq
    const response = await this.groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  }

  async getChatInformation(args: { chatId: string }): Promise<AgentDescriptor> {
    const { chatId } = args;

    const agentData = await db.getAgent({ id: chatId });

    if (!agentData) {
      throw new Error(`Agent with ID ${chatId} not found`);
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
      mcpServers: agentData.mcpServers || [],
    };

    return agentDescriptor;
  }

  async addMCPServer(args: {
    name: string;
    transport: "stdio" | "websocket" | "custom";
    connectionInfo: any;
  }): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async removeMCPServer(args: { serverId: string }): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async toggleMCPServer(args: { serverId: string }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
