import { experimental_createMCPClient } from "@ai-sdk/mcp";
import type { AgentDescriptor, IAgent } from "../types/agent";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import db from "../db/client";
import { eq, and } from "drizzle-orm";
import schema from "../db/schema";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { HumanMessage, AIMessage, SystemMessage, type BaseMessage, ToolMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { env } from "../env";
import type { Hex } from "viem";
import { tryCatch } from "./tryCatch";
import { appd } from "./appd";
import { getOrCreateDataset } from "./synapse";
import { jsonParse } from "./json";

export class Agent implements IAgent {
  static async fromId({ id }: { id: number }) {
    const [agentData] = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, Number(id)));

    if (!agentData) {
      throw new Error(`Agent with ID ${id} not found`);
    }

    // Fetch MCP servers from selectedMcp table
    const selectedMcps = await db
      .select({
        mcpServer: schema.mcpServers,
        selectedMcp: schema.selectedMcp,
      })
      .from(schema.selectedMcp)
      .innerJoin(
        schema.mcpServers,
        eq(schema.selectedMcp.mcpId, schema.mcpServers.id),
      )
      .where(
        and(
          eq(schema.selectedMcp.agentId, Number(id)),
          eq(schema.selectedMcp.isActive, true),
        ),
      );

    // Transform to AgentDescriptor format
    const mcpServers: AgentDescriptor["mcpServers"] = selectedMcps.map(
      ({ mcpServer, selectedMcp }) => ({
        id: mcpServer.id.toString(),
        name: mcpServer.name,
        url: mcpServer.url,
        authHeaders: selectedMcp.authToken
          ? { Authorization: `Bearer ${selectedMcp.authToken}` }
          : undefined,
        enabled: selectedMcp.isActive ?? true,
      }),
    );

    const ds = await getOrCreateDataset();
    const registrationPieceCid = agentData.registrationPieceCid;

    const registrationBytes = await ds.download(registrationPieceCid);
    const registration = jsonParse(new TextDecoder().decode(registrationBytes));

    if (!registration) {
      throw new Error(`Registration for agent ${agentData.id} not found`);
    }
    const agentDescriptor: AgentDescriptor = {
      id: agentData.id,
      imageUrl: agentData.imageUrl,
      description: agentData.description,
      model: agentData.model,
      keySeed: agentData.keySeed,
      ens: agentData.ens,
      registrationPieceCid: agentData.registrationPieceCid,
      registration: registration,
      baseSystemPrompt: agentData.baseSystemPrompt,
      knowledgeBases: (agentData.knowledgeBases ||
        []) as AgentDescriptor["knowledgeBases"],
      tools: (agentData.tools || []) as AgentDescriptor["tools"],
      mcpServers,
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
    public agentDescriptor: AgentDescriptor,
    public privateKey: Hex,
  ) {}

  async generateResponse(args: {
    message: string;
    chatId?: string;
  }): Promise<string> {
    const { message, chatId } = args;

    const messages: BaseMessage[] = [];

    if (this.agentDescriptor.baseSystemPrompt) {
      messages.push(new SystemMessage(this.agentDescriptor.baseSystemPrompt));
    }

    if (chatId) {
      try {
        const history = await db
          .select()
          .from(schema.chatHistory)
          .where(eq(schema.chatHistory.chatId, chatId));
        for (const msg of history) {
          console.log(msg);
          if (msg.role === "user" || msg.role === "human") {
            messages.push(new HumanMessage(msg.content));
          } else if (msg.role === "assistant" || msg.role === "ai") {
            messages.push(new AIMessage(msg.content));
          } else if (msg.role === "system") {
            messages.push(new SystemMessage(msg.content));
          }
        }
      } catch (error) {
        console.warn(`Failed to load chat history for ${chatId}:`, error);
      }
    }

    messages.push(new HumanMessage(message));

    // Collect MCP tools
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
    const mcpTools = await evmMcpClient.tools();

    for (const mcp of this.agentDescriptor.mcpServers) {
      const mcpClient = await experimental_createMCPClient({
        transport: new StreamableHTTPClientTransport(new URL(mcp.url), {
          requestInit: { headers: mcp.authHeaders },
        }),
      });
      const mcpClientTools = await mcpClient.tools();
      Object.assign(mcpTools, mcpClientTools);
    }

    // Convert MCP tools to LangChain tools
    const langchainTools = Object.entries(mcpTools).map(([name, tool]) => {
      const toolAny = tool as unknown as {
        description?: string;
        parameters?: { properties?: Record<string, unknown> };
        execute: (input: unknown, options?: unknown) => Promise<unknown>;
      };
      return new DynamicStructuredTool({
        name: name,
        description: toolAny.description || `Tool: ${name}`,
        schema: z.object(toolAny.parameters?.properties || {}),
        func: async (input) => {
          const result = await Promise.resolve(toolAny.execute(input, {}));
          return JSON.stringify(result);
        },
      });
    });

    // Initialize LLM
    const llm = new ChatOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
      model: this.agentDescriptor.model,
      temperature: 0.7,
    });

    // Define state annotation
    const StateAnnotation = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    // Define the agent node
    const callModel = async (state: typeof StateAnnotation.State) => {
      const modelWithTools = llm.bindTools(langchainTools);
      const response = await modelWithTools.invoke(state.messages);
      return { messages: [response] };
    };

    // Define the tool execution node
    const callTools = async (state: typeof StateAnnotation.State) => {
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
      const toolCalls = lastMessage.tool_calls || [];

      const toolMessages: ToolMessage[] = [];

      for (const toolCall of toolCalls) {
        const tool = langchainTools.find((t) => t.name === toolCall.name);
        if (tool) {
          try {
            const result = await tool.invoke(toolCall.args);
            toolMessages.push(
              new ToolMessage({
                tool_call_id: toolCall.id || "",
                content: result,
              })
            );
          } catch (error) {
            toolMessages.push(
              new ToolMessage({
                tool_call_id: toolCall.id || "",
                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              })
            );
          }
        }
      }

      return { messages: toolMessages };
    };

    // Routing function to decide whether to continue or end
    const shouldContinue = (state: typeof StateAnnotation.State) => {
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
      if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
      }
      return END;
    };

    // Build the graph
    const workflow = new StateGraph(StateAnnotation)
      .addNode("agent", callModel)
      .addNode("tools", callTools)
      .addEdge(START, "agent")
      .addConditionalEdges("agent", shouldContinue, {
        tools: "tools",
        [END]: END,
      })
      .addEdge("tools", "agent");

    const app = workflow.compile();

    // Execute the graph
    const result = await app.invoke({
      messages: messages,
    });

    console.log(result);

    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.content as string;
  }
}
