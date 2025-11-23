import { useState } from "react";
import {
  useChatHistory,
  useUpdateChatAgent,
  useSendMessage,
  useChats,
  useAgents,
} from "../../../lib/hooks/use-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Section } from "./Section";

interface ChatInteractionSectionProps {
  activeChatId: string;
  selectedAgentId: string;
  onChatIdChange: (chatId: string) => void;
}

export function ChatInteractionSection({
  activeChatId,
  selectedAgentId,
  onChatIdChange,
}: ChatInteractionSectionProps) {
  const {
    data: history,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: errorHistory,
  } = useChatHistory(activeChatId);
  const {
    mutate: sendMessage,
    isPending: isSendingMessage,
  } = useSendMessage();
  const {
    mutate: updateChatAgent,
    isPending: isUpdatingChatAgent,
  } = useUpdateChatAgent();
  const { data: chats } = useChats();
  const { data: agents } = useAgents();
  const [message, setMessage] = useState("");

  const activeChat = chats?.find((c) => c.id === activeChatId);
  const hasAgent = activeChat?.agentId != null;

  return (
    <Section title="4. Active Conversation">
      <div className="mb-4">
        <label
          htmlFor="activeChatId"
          className="text-xs font-medium text-muted-foreground"
        >
          Active Chat ID
        </label>
        <Input
          id="activeChatId"
          value={activeChatId}
          onChange={(e) => onChatIdChange(e.target.value)}
          className="h-9 text-sm mt-2 bg-background border-input"
          placeholder="Select a chat above..."
        />
      </div>

      {activeChatId ? (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          {!hasAgent && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500 text-sm font-medium">
                  ⚠️ Warning:
                </span>
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This chat has no associated agent. You cannot send messages until an agent is linked.
                  </p>
                  {selectedAgentId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 text-xs"
                      onClick={() =>
                        updateChatAgent({
                          chatId: activeChatId,
                          agentId: Number(selectedAgentId),
                        })
                      }
                      disabled={isUpdatingChatAgent}
                    >
                      {isUpdatingChatAgent
                        ? "Linking..."
                        : `Link Selected Agent (${agents?.find((a) => a.id === selectedAgentId)?.name || selectedAgentId})`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-muted/30">
            {isLoadingHistory && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Skeleton className="h-12 w-48" />
                </div>
                <div className="flex justify-start">
                  <Skeleton className="h-12 w-48" />
                </div>
              </div>
            )}
            {isErrorHistory && (
              <div className="text-sm text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
                <div className="font-medium mb-1">Error loading messages:</div>
                <div className="text-xs">
                  {errorHistory instanceof Error
                    ? errorHistory.message
                    : "Unknown error"}
                </div>
              </div>
            )}
            {!isLoadingHistory && !isErrorHistory && history?.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                No messages yet. Start the conversation.
              </div>
            )}
            {!isLoadingHistory && !isErrorHistory && history?.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.role === "user"
                    ? "ml-auto items-end"
                    : "mr-auto items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 uppercase px-1">
                  {msg.role}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !isSendingMessage &&
                  message.trim() &&
                  hasAgent
                ) {
                  sendMessage({ chatId: activeChatId, content: message });
                  setMessage("");
                }
              }}
              placeholder={
                hasAgent
                  ? "Type a message..."
                  : "Associate an agent first..."
              }
              className="flex-1 bg-background"
              disabled={isSendingMessage || !hasAgent}
            />
            <Button
              onClick={() => {
                if (!isSendingMessage && message.trim() && hasAgent) {
                  sendMessage({ chatId: activeChatId, content: message });
                  setMessage("");
                }
              }}
              disabled={isSendingMessage || !message.trim() || !hasAgent}
            >
              {isSendingMessage ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-8 border border-dashed border-border rounded-md text-center">
          Select a chat to start messaging.
        </div>
      )}
    </Section>
  );
}

