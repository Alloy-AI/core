import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { apiClient } from "../utils/api-client";

// --- Types ---

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  baseSystemPrompt: string;
  tools?: Tool[];
  registrationPieceCid?: string;
}

export interface Tool {
  id: string;
  name: string;
  kind: "builtin" | "mcp";
  ref: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface Chat {
  id: string;
  walletAddress: string;
  agentId?: number | null;
  createdAt: string;
}

export interface Message {
  id?: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// --- Helper ---

function useAuthHeaders() {
  const { address } = useAccount();
  return {
    headers: {
      Authorization: address ? `Bearer ${address}` : "",
    },
    enabled: !!address,
  };
}

// --- Agents Hooks ---

export function useAgents() {
  const { headers, enabled } = useAuthHeaders();
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ agents: Agent[] }>>(
        "/agents",
        { headers },
      );
      return res.data.agents;
    },
    enabled,
  });
}

export function useAgent(id: string) {
  const { headers, enabled } = useAuthHeaders();
  return useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ agent: Agent }>>(
        `/agents/${id}`,
        { headers },
      );
      return res.data.agent;
    },
    enabled: enabled && !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      model: string;
      baseSystemPrompt: string;
      chains: number[];
    }) => {
      const res = await apiClient.post<ApiResponse<{ agentId: string }>>(
        "/agents",
        data,
        { headers },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
}

export function useUpdateAgentPrompt() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      id,
      baseSystemPrompt,
    }: {
      id: string;
      baseSystemPrompt: string;
    }) => {
      const res = await apiClient.put<ApiResponse<unknown>>(
        `/agents/${id}/base-system-prompt`,
        { baseSystemPrompt },
        { headers },
      );
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["agent", id] });
      toast.success("System prompt updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update prompt: ${error.message}`);
    },
  });
}

// --- Chats Hooks ---

export function useChats() {
  const { headers, enabled } = useAuthHeaders();
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ chats: Chat[] }>>(
        "/chats",
        { headers },
      );
      return res.data.chats;
    },
    enabled,
  });
}

export function useChatHistory(chatId: string) {
  const { headers, enabled } = useAuthHeaders();
  return useQuery({
    queryKey: ["chat-history", chatId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ messages: Message[] }>>(
        `/chats/${chatId}/messages`,
        { headers },
      );
      return res.data.messages;
    },
    enabled: enabled && !!chatId,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async (data: { agentId?: number } = {}) => {
      const res = await apiClient.post<ApiResponse<{ chatId: string }>>(
        "/chats",
        data,
        { headers },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create chat: ${error.message}`);
    },
  });
}

export function useUpdateChatAgent() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      chatId,
      agentId,
    }: {
      chatId: string;
      agentId: number;
    }) => {
      const res = await apiClient.put<ApiResponse<{ chat: Chat }>>(
        `/chats/${chatId}`,
        { agentId },
        { headers },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Agent associated with chat");
    },
    onError: (error: Error) => {
      toast.error(`Failed to associate agent: ${error.message}`);
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
      role = "user",
    }: {
      chatId: string;
      content: string;
      role?: "user" | "assistant";
    }) => {
      const res = await apiClient.post<ApiResponse<Message>>(
        `/chats/${chatId}/messages`,
        { content, role },
        { headers },
      );
      return res.data;
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["chat-history", chatId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

// --- Tools Hooks ---

export function useAddTool() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      agentId,
      tool,
    }: {
      agentId: string;
      tool: {
        label: string;
        kind: "builtin" | "mcp";
        ref: string;
        config?: Record<string, unknown>;
      };
    }) => {
      const res = await apiClient.post<ApiResponse<{ toolId: string }>>(
        `/tools/${agentId}`,
        tool,
        { headers },
      );
      return res.data;
    },
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      toast.success("Tool added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add tool: ${error.message}`);
    },
  });
}

export function useRemoveTool() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      agentId,
      toolId,
    }: {
      agentId: string;
      toolId: string;
    }) => {
      const res = await apiClient.delete<ApiResponse<unknown>>(
        `/tools/${agentId}/${toolId}`,
        { headers },
      );
      return res.data;
    },
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      toast.success("Tool removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove tool: ${error.message}`);
    },
  });
}

export function useToggleTool() {
  const queryClient = useQueryClient();
  const { headers } = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      agentId,
      toolId,
    }: {
      agentId: string;
      toolId: string;
    }) => {
      const res = await apiClient.patch<ApiResponse<{ enabled: boolean }>>(
        `/tools/${agentId}/${toolId}/toggle`,
        {},
        { headers },
      );
      return res.data;
    },
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle tool: ${error.message}`);
    },
  });
}
