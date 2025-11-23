// import { z } from "zod";
// import db from "../db/client";
// import type { AgentDescriptor } from "../types/agent";
// import { Agent } from "./Agent";
// import { AgentCardSchema } from "./zod";

// // Types & Schemas
// export type TaskState =
//   | "submitted"
//   | "working"
//   | "input-required"
//   | "completed"
//   | "failed"
//   | "canceled"
//   | "unknown";

// export type MessageRole = "user" | "assistant" | "agent" | "system";

// export interface MessagePart {
//   kind: "text" | "file" | "data" | "artifact";
//   text?: string;
//   file?: {
//     mimeType: string;
//     data: string; // base64 encoded
//     name?: string;
//   };
//   data?: Record<string, unknown>;
//   artifactId?: string;
// }

// export interface Message {
//   messageId?: string;
//   role: MessageRole;
//   parts: MessagePart[];
// }

// export interface Task {
//   id: string;
//   status: {
//     state: TaskState;
//     message?: string;
//     error?: string;
//   };
//   history: Message[];
//   metadata?: Record<string, unknown>;
//   contextId?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Artifact {
//   artifactId: string;
//   taskId: string;
//   parts: MessagePart[];
//   append?: boolean;
//   lastChunk?: boolean;
//   kind?: "artifact-update";
// }

// // JSON-RPC 2.0 Request/Response
// export interface JsonRpcRequest {
//   jsonrpc: "2.0";
//   id: string | number | null;
//   method: string;
//   params?: Record<string, unknown>;
// }

// export interface JsonRpcResponse {
//   jsonrpc: "2.0";
//   id: string | number | null;
//   result?: unknown;
//   error?: {
//     code: number;
//     message: string;
//     data?: unknown;
//   };
// }

// // In-Memory Task Store
// class TaskStore {
//   private tasks = new Map<string, Task>();
//   private contextTasks = new Map<string, Set<string>>(); // contextId -> taskIds

//   createTask(task: Task): void {
//     this.tasks.set(task.id, task);
//     if (task.contextId) {
//       if (!this.contextTasks.has(task.contextId)) {
//         this.contextTasks.set(task.contextId, new Set());
//       }
//       this.contextTasks.get(task.contextId)!.add(task.id);
//     }
//   }

//   getTask(taskId: string): Task | undefined {
//     return this.tasks.get(taskId);
//   }

//   updateTask(taskId: string, updates: Partial<Task>): void {
//     const task = this.tasks.get(taskId);
//     if (!task) return;

//     const updated = {
//       ...task,
//       ...updates,
//       updatedAt: new Date().toISOString(),
//     };
//     this.tasks.set(taskId, updated);
//   }

//   cancelTask(taskId: string): boolean {
//     const task = this.tasks.get(taskId);
//     if (!task) return false;

//     if (
//       task.status.state === "completed" ||
//       task.status.state === "failed" ||
//       task.status.state === "canceled"
//     ) {
//       return false; // Already terminal
//     }

//     this.updateTask(taskId, {
//       status: {
//         state: "canceled",
//         message: "Task canceled by user",
//       },
//     });
//     return true;
//   }

//   getTasksByContext(contextId: string): Task[] {
//     const taskIds = this.contextTasks.get(contextId);
//     if (!taskIds) return [];
//     return Array.from(taskIds)
//       .map((id) => this.tasks.get(id))
//       .filter((t): t is Task => t !== undefined);
//   }

//   deleteTask(taskId: string): void {
//     const task = this.tasks.get(taskId);
//     if (task?.contextId) {
//       this.contextTasks.get(task.contextId)?.delete(taskId);
//     }
//     this.tasks.delete(taskId);
//   }
// }

// const taskStore = new TaskStore();

// // AgentCard Functions
// export async function getAgentCard(args: {
//   id?: string;
//   humanReadableId?: string;
//   agentId?: string;
// }) {
//   const card = await db.getAgentCard(args);
//   if (!card) return null;

//   // Return public card (without internal fields)
//   const publicCard = {
//     schemaVersion: card.schemaVersion,
//     humanReadableId: card.humanReadableId,
//     agentVersion: card.agentVersion,
//     name: card.name,
//     description: card.description,
//     url: card.url,
//     provider: card.provider,
//     capabilities: card.capabilities,
//     authSchemes: card.authSchemes,
//     skills: card.skills,
//     tags: card.tags,
//     iconUrl: card.iconUrl,
//     lastUpdated: card.lastUpdated,
//   };

//   return AgentCardSchema.parse(publicCard);
// }

// // Task Execution
// async function executeTask(
//   agentId: string,
//   message: Message,
//   contextId?: string,
// ): Promise<Task> {
//   const taskId = Bun.randomUUIDv7();
//   const now = new Date().toISOString();

//   const task: Task = {
//     id: taskId,
//     status: {
//       state: "submitted",
//     },
//     history: [message],
//     contextId,
//     createdAt: now,
//     updatedAt: now,
//   };

//   taskStore.createTask(task);

//   // Update to working state
//   taskStore.updateTask(taskId, {
//     status: { state: "working" },
//   });

//   try {
//     // Load agent data from database
//     const agentData = await db.getAgent({ id: agentId });
//     if (!agentData) {
//       throw new Error(`Agent with ID ${agentId} not found`);
//     }

//     // Create a minimal registration for A2A use cases
//     // Registration is not required for A2A task execution, but AgentDescriptor requires it
//     const minimalRegistration = {
//       type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1" as const,
//       name: "A2A Agent",
//       description: "Agent accessible via A2A protocol",
//       endpoints: [],
//       registrations: [],
//       supportedTrust: [],
//     };

//     // Create agent descriptor for A2A
//     const agentDescriptor: AgentDescriptor = {
//       id: agentData.id,
//       model: agentData.model,
//       registrationPieceCid: agentData.registrationPieceCid,
//       registration: minimalRegistration,
//       baseSystemPrompt: agentData.baseSystemPrompt,
//       knowledgeBases: agentData.knowledgeBases || [],
//       tools: agentData.tools || [],
//       mcpServers: (agentData.mcpServers || []) as AgentDescriptor["mcpServers"],
//     };

//     // Create agent instance directly (bypassing Agent.fromId which requires registration)
//     // We use a type assertion to access the protected constructor
//     const AgentClass = Agent as any;
//     const agent = new AgentClass(agentDescriptor);

//     const textParts = message.parts
//       .filter((p) => p.kind === "text")
//       .map((p) => p.text || "")
//       .join("\n");

//     // Generate response using the agent
//     const responseText = await agent.generateResponse({
//       message: textParts,
//       chatId: contextId,
//     });

//     // Create assistant message
//     const assistantMessage: Message = {
//       role: "assistant",
//       parts: [{ kind: "text", text: responseText }],
//     };

//     // Update task with response
//     const updatedTask = taskStore.getTask(taskId);
//     if (updatedTask) {
//       taskStore.updateTask(taskId, {
//         history: [...updatedTask.history, assistantMessage],
//         status: {
//           state: "completed",
//           message: "Task completed successfully",
//         },
//       });
//     }

//     return taskStore.getTask(taskId)!;
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     taskStore.updateTask(taskId, {
//       status: {
//         state: "failed",
//         error: errorMessage,
//       },
//     });
//     throw error;
//   }
// }

// // JSON-RPC Method Handlers
// export async function handleMessageSend(
//   agentId: string,
//   params: {
//     message: Message;
//     metadata?: Record<string, unknown>;
//     contextId?: string;
//     skillId?: string;
//     taskType?: string;
//   },
// ): Promise<JsonRpcResponse> {
//   try {
//     const { message, contextId } = params;

//     if (!message || !message.parts || message.parts.length === 0) {
//       return {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32602,
//           message: "Invalid params: message with parts is required",
//         },
//       };
//     }

//     const task = await executeTask(agentId, message, contextId);

//     return {
//       jsonrpc: "2.0",
//       id: null,
//       result: task,
//     };
//   } catch (error) {
//     return {
//       jsonrpc: "2.0",
//       id: null,
//       error: {
//         code: -32000,
//         message: error instanceof Error ? error.message : "Internal error",
//       },
//     };
//   }
// }

// export async function handleTasksGet(params: {
//   id: string;
// }): Promise<JsonRpcResponse> {
//   try {
//     const { id } = params;

//     if (!id) {
//       return {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32602,
//           message: "Invalid params: id is required",
//         },
//       };
//     }

//     const task = taskStore.getTask(id);

//     if (!task) {
//       return {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32001,
//           message: "Task not found",
//         },
//       };
//     }

//     return {
//       jsonrpc: "2.0",
//       id: null,
//       result: task,
//     };
//   } catch (error) {
//     return {
//       jsonrpc: "2.0",
//       id: null,
//       error: {
//         code: -32000,
//         message: error instanceof Error ? error.message : "Internal error",
//       },
//     };
//   }
// }

// export async function handleTasksCancel(params: {
//   id: string;
// }): Promise<JsonRpcResponse> {
//   try {
//     const { id } = params;

//     if (!id) {
//       return {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32602,
//           message: "Invalid params: id is required",
//         },
//       };
//     }

//     const canceled = taskStore.cancelTask(id);

//     if (!canceled) {
//       return {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32002,
//           message: "Task cannot be canceled (not found or already terminal)",
//         },
//       };
//     }

//     const task = taskStore.getTask(id);

//     return {
//       jsonrpc: "2.0",
//       id: null,
//       result: task,
//     };
//   } catch (error) {
//     return {
//       jsonrpc: "2.0",
//       id: null,
//       error: {
//         code: -32000,
//         message: error instanceof Error ? error.message : "Internal error",
//       },
//     };
//   }
// }

// // Main JSON-RPC Handler
// export async function handleJsonRpc(
//   agentId: string,
//   request: JsonRpcRequest,
// ): Promise<JsonRpcResponse> {
//   const { method, params = {}, id } = request;

//   let response: JsonRpcResponse;

//   switch (method) {
//     case "message/send":
//     case "tasks/send":
//       response = await handleMessageSend(agentId, params as any);
//       break;

//     case "tasks/get":
//       response = await handleTasksGet(params as any);
//       break;

//     case "tasks/cancel":
//       response = await handleTasksCancel(params as any);
//       break;

//     default:
//       response = {
//         jsonrpc: "2.0",
//         id,
//         error: {
//           code: -32601,
//           message: `Method not found: ${method}`,
//         },
//       };
//   }

//   // Preserve request ID in response
//   response.id = id;

//   return response;
// }

// // AgentCard Endpoint Helper
// export async function getAgent(args: { id: string }) {
//   return await getAgentCard({ agentId: args.id });
// }
