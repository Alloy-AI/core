import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { formatEther } from "viem";
import Icon from "@/src/lib/components/custom/Icon";
import { Button } from "@/src/lib/components/ui/button";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useChatStore, useStore } from "@/src/lib/hooks/use-store";
import FundOrgDialog from "../../FundOrg";
import Layout from "../../layout";
import ChatArea from "./components/ChatArea";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";

export default function ChatWithAgent() {
  const { id } = useParams({
    from: "/dashboard/agents/$id/chat",
  });

  const haithe = useHaitheApi();
  const { selectedOrg } = useStore();
  const { selectedModel } = useChatStore();
  const queryClient = useQueryClient();

  console.log({
    selectedOrg,
  });

  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get agent data
  const agentsQuery = haithe.getProjects(Number(selectedOrg?.id));
  const agent = agentsQuery.data?.find((a) => a.id.toString() === id);

  // Get enabled models for the organization
  const enabledModelsQuery = haithe.getEnabledModels(Number(selectedOrg?.id));

  // Get organization balance
  const balanceQuery = haithe.organizationBalance(Number(selectedOrg?.id));

  // Get total price per call for all enabled products of this agent
  const pricePerCallQuery = haithe.pricePerCall(Number(id));

  // Get conversations for this agent
  const conversationsQuery = haithe.getConversations(
    selectedOrg?.organization_uid || "",
    agent?.project_uid || "",
  );

  // Get messages for current conversation
  const messagesQuery = haithe.getConversationMessages(
    currentConversationId || 0,
    selectedOrg?.organization_uid || "",
    agent?.project_uid || "",
  );

  // Create conversation mutation
  const createConversationMutation = haithe.createConversation;
  const createMessageMutation = haithe.createMessage;
  const getCompletionsMutation = haithe.getCompletions;

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !selectedOrg || !agent) return;

    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // If no conversation exists, create one
      if (!conversationId) {
        const newConversation = await createConversationMutation.mutateAsync({
          orgUid: selectedOrg.organization_uid,
          projectUid: agent.project_uid,
        });
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }

      // Send the user message
      const res = await createMessageMutation.mutateAsync({
        conversationId: conversationId,
        message: content.trim(),
        sender: "user",
        orgUid: selectedOrg.organization_uid,
        projectUid: agent.project_uid,
      });

      if (!selectedModel) {
        throw new Error("No model selected");
      }

      // Get message history for context (last 10 messages)
      const messageHistory = messagesQuery.data || [];
      const recentMessages = messageHistory.slice(-10); // Get last 10 messages

      // Convert message history to OpenAI format
      const messagesForCompletion = recentMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message,
      }));

      // Add the current user message
      messagesForCompletion.push({
        role: "user",
        content: content.trim(),
      });

      // Get AI completion
      const completion = await getCompletionsMutation.mutateAsync({
        orgUid: selectedOrg.organization_uid,
        projectUid: agent.project_uid,
        body: {
          model: selectedModel,
          messages: messagesForCompletion,
          temperature: 1,
        },
      });

      // Send the AI response as a message
      if (completion.choices && completion.choices.length > 0) {
        const aiResponse = completion.choices[0].message.content;
        await createMessageMutation.mutateAsync({
          conversationId: conversationId,
          message: aiResponse,
          sender: "ai",
          orgUid: selectedOrg.organization_uid,
          projectUid: agent.project_uid,
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [
          "conversationMessages",
          conversationId,
          selectedOrg.organization_uid,
          agent.project_uid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "conversations",
          selectedOrg.organization_uid,
          agent.project_uid,
        ],
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(parseInt(conversationId));
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // Transform API data to component format
  const messages =
    messagesQuery.data?.map((msg) => ({
      id: msg.id.toString(),
      content: msg.message,
      isUser: msg.sender === "user",
      timestamp: new Date(msg.created_at),
    })) || [];

  const conversations =
    conversationsQuery.data?.map((conv) => ({
      id: conv.id.toString(),
      title: conv.title || "New Conversation",
      lastMessage: "No messages yet", // API doesn't provide this field
      timestamp: new Date(conv.updated_at || conv.created_at),
      messageCount: 0, // API doesn't provide this field
      messages: [], // We don't need to load all messages here
    })) || [];

  // Check if any models are enabled
  const hasEnabledModels =
    enabledModelsQuery.data && enabledModelsQuery.data.length > 0;

  // Get the selected model's price per call
  const selectedModelData = enabledModelsQuery.data?.find(
    (model) => model.name === selectedModel,
  );
  const modelPricePerCall = selectedModelData?.price_per_call || 0;

  // Get the total price per call for all enabled products of this agent
  const agentPricePerCall = pricePerCallQuery.data?.total_price_per_call || 0;

  // Total price per call = agent products + LLM model
  const totalPricePerCall = agentPricePerCall + modelPricePerCall;
  const organizationBalance = balanceQuery.data?.balance || 0;

  // Check if balance is sufficient for the total price per call
  const hasSufficientBalance =
    organizationBalance !== 0 && organizationBalance >= totalPricePerCall;

  // Loading state
  if (agentsQuery.isPending) {
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

  if (!agent) {
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
      <div className="min-h-full bg-background flex flex-col w-full">
        {/* Chat Header */}
        <ChatHeader
          agent={{
            id: agent.id.toString(),
            name: agent.name,
            description: undefined,
            status: "online",
          }}
          conversations={conversations}
          currentConversationId={currentConversationId?.toString()}
          onSelectConversation={selectConversation}
          onNewConversation={startNewConversation}
          balance={balanceQuery.data}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 ">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            agentName={agent.name}
            onPromptClick={handlePromptClick}
          />

          {/* Warning when no models are enabled */}
          {!hasEnabledModels && enabledModelsQuery.data !== undefined && (
            <div className="mb-10 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon
                  name="TriangleAlert"
                  className="size-5 text-yellow-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">
                    No models enabled
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your organization needs to enable at least one model to chat
                    with your agent.
                    <Link
                      to="/dashboard/settings"
                      className="text-yellow-800 underline hover:text-yellow-900 ml-1"
                    >
                      Go to settings
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning when balance is insufficient */}
          {hasEnabledModels &&
            !hasSufficientBalance &&
            balanceQuery.data !== undefined &&
            selectedModel && (
              <div className="mb-10 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon
                    name="TriangleAlert"
                    className="size-5 text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex items-center justify-between w-full gap-10">
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Insufficient balance
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Your organization balance ($
                        {formatEther(BigInt(organizationBalance))}) is
                        insufficient for the total cost per call.
                      </p>
                    </div>
                    {selectedOrg && (
                      <FundOrgDialog
                        organization={selectedOrg}
                        refetchBalance={balanceQuery.refetch}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Input Area */}
          <ChatInput
            onSendMessage={sendMessage}
            placeholder={`Type your message to ${agent.name}...`}
            disabled={!hasEnabledModels || !hasSufficientBalance}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
