import { Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import Icon from "@/src/lib/components/custom/Icon";
import { Button } from "@/src/lib/components/ui/button";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import {
  useAgent,
  useChats,
  useChatHistory,
  useCreateChat,
  useSendMessage,
} from "@/src/lib/hooks/use-api";
import Layout from "../../layout";
import ChatArea from "./components/ChatArea";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";

export default function ChatWithAgent() {
  const { agentId } = useParams({
    from: "/dashboard/agent/$agentId/chat",
  });

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Get agent data
  const {
    data: agent,
    isLoading: isLoadingAgent,
    isError: isErrorAgent,
  } = useAgent(agentId || "");

  // Get all chats
  const { data: chats, isLoading: isLoadingChats } = useChats();

  // Get messages for current chat
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useChatHistory(currentChatId || "");

  // Mutations
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();

  // Filter chats for this agent
  const agentChats =
    chats?.filter((chat) => chat.agentId?.toString() === agentId) || [];

  // Auto-select first chat if available and none selected
  useEffect(() => {
    if (
      !currentChatId &&
      agentChats.length > 0 &&
      agentChats[0]?.id &&
      !isLoadingChats
    ) {
      setCurrentChatId(agentChats[0].id);
    }
  }, [agentChats, currentChatId, isLoadingChats]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !agentId) return;

    setPendingMessage(content.trim());
    const chatId = currentChatId;

    // If no chat exists, create one
    if (!chatId) {
      createChat(
        { agentId: Number(agentId) },
        {
          onSuccess: (response) => {
            const newChatId = response.chatId;
            setCurrentChatId(newChatId);
            // Send message after chat is created
            sendMessage(
              {
                chatId: newChatId,
                content: content.trim(),
              },
              {
                onSuccess: () => setPendingMessage(null),
                onError: () => setPendingMessage(null),
              },
            );
          },
          onError: () => setPendingMessage(null),
        },
      );
      return;
    }

    // Send the message
    sendMessage(
      {
        chatId,
        content: content.trim(),
      },
      {
        onSuccess: () => setPendingMessage(null),
        onError: () => setPendingMessage(null),
      },
    );
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const startNewChat = () => {
    createChat(
      { agentId: Number(agentId) },
      {
        onSuccess: (response) => {
          setCurrentChatId(response.chatId);
        },
      },
    );
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Transform API data to component format
  const transformedMessages =
    messages?.map((msg) => ({
      id: msg.id || `${msg.chatId}-${msg.content.slice(0, 10)}`,
      content: msg.content,
      isUser: msg.role === "user",
      timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    })) || [];

  const transformedChats =
    agentChats.map((chat) => ({
      id: chat.id,
      title: `Chat ${chat.id.slice(0, 8)}`,
      lastMessage: "No messages yet",
      timestamp: new Date(chat.createdAt),
      messageCount: 0,
      messages: [],
    })) || [];

  const isSending = isSendingMessage || isCreatingChat;

  // Loading state
  if (isLoadingAgent) {
    return (
      <Layout>
        <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isErrorAgent || !agent) {
    return (
      <Layout>
        <div className="min-h-full bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md w-full">
            <Icon
              name="Bot"
              className="size-16 text-muted-foreground mx-auto"
            />
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Agent Not Found</h3>
              <p className="text-muted-foreground">
                The agent you're looking for doesn't exist or you don't have
                access to it.
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/agents">Back to Agents</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100dvh-var(--navbar-height)-3rem)] bg-background flex flex-col w-full overflow-hidden">
        {/* Chat Header */}
        <ChatHeader
          agent={{
            id: agent.id,
            name: agent.name,
            description: agent.description,
            status: "online",
          }}
          conversations={transformedChats}
          currentConversationId={currentChatId || undefined}
          onSelectConversation={selectChat}
          onNewConversation={startNewChat}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 overflow-hidden">
          <ChatArea
            messages={transformedMessages}
            isLoading={isSending}
            agentName={agent.name}
            onPromptClick={handlePromptClick}
            pendingMessage={pendingMessage}
          />

          {/* Warning when no chat is selected */}
          {!currentChatId && agentChats.length === 0 && (
            <div className="mb-10 p-4 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <Icon
                  name="Info"
                  className="size-5 text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">
                    No chat started
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a new conversation by sending a message below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder={`Type your message to ${agent.name}...`}
            disabled={false}
            isLoading={isSending}
          />
        </div>
      </div>
    </Layout>
  );
}
