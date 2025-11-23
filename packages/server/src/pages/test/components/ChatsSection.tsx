import { useState } from "react";
import {
  useChats,
  useCreateChat,
  useUpdateChatAgent,
  useAgents,
} from "../../../lib/hooks/use-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Section } from "./Section";

interface ChatsSectionProps {
  selectedAgentId: string;
  onSelectChat: (chatId: string) => void;
}

export function ChatsSection({
  selectedAgentId,
  onSelectChat,
}: ChatsSectionProps) {
  const {
    data: chats,
    isLoading: isLoadingChats,
    isError: isErrorChats,
    error: errorChats,
    refetch: refetchChats,
  } = useChats();
  const {
    mutate: createChat,
    isPending: isCreatingChat,
  } = useCreateChat();
  const {
    mutate: updateChatAgent,
    isPending: isUpdatingChatAgent,
  } = useUpdateChatAgent();
  const { data: agents } = useAgents();
  const [chatAgentId, setChatAgentId] = useState<string>("");

  return (
    <Section title="3. Chats">
      <div className="flex gap-4 items-end">
        <div className="grid gap-2 flex-1">
          <label
            htmlFor="chatAgentId"
            className="text-xs font-medium text-muted-foreground"
          >
            Link Agent ID (Optional)
          </label>
          <Input
            id="chatAgentId"
            value={chatAgentId}
            onChange={(e) => setChatAgentId(e.target.value)}
            className="h-9 text-sm bg-background border-input"
            placeholder="Agent ID..."
          />
        </div>
        <Button
          size="sm"
          onClick={() =>
            createChat(chatAgentId ? { agentId: Number(chatAgentId) } : {})
          }
          disabled={isCreatingChat}
          className="h-9"
        >
          {isCreatingChat ? "Creating..." : "Create Chat"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetchChats()}
          disabled={isLoadingChats}
          className="h-9"
        >
          {isLoadingChats ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-2 mt-4">
        {isLoadingChats && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {isErrorChats && (
          <div className="text-sm text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
            <div className="font-medium mb-1">Error loading chats:</div>
            <div className="text-xs">
              {errorChats instanceof Error
                ? errorChats.message
                : "Unknown error"}
            </div>
          </div>
        )}
        {!isLoadingChats && !isErrorChats && chats?.map((c) => {
          const associatedAgent = agents?.find((a) => a.id === c.agentId?.toString());
          return (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-md text-sm hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-card-foreground">
                  Chat {c.id.slice(0, 8)}...{" "}
                  <span className="text-muted-foreground text-xs ml-2">
                    ({new Date(c.createdAt).toLocaleTimeString()})
                  </span>
                </span>
                {c.agentId ? (
                  <span className="text-xs text-muted-foreground">
                    Agent: {associatedAgent?.name || `ID: ${c.agentId}`}
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 dark:text-yellow-500">
                    ⚠️ No agent associated
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!c.agentId && selectedAgentId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() =>
                      updateChatAgent({
                        chatId: c.id,
                        agentId: Number(selectedAgentId),
                      })
                    }
                    disabled={isUpdatingChatAgent}
                  >
                    {isUpdatingChatAgent ? "..." : "Link Agent"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => onSelectChat(c.id)}
                >
                  Open
                </Button>
              </div>
            </div>
          );
        })}
        {!isLoadingChats && !isErrorChats && !chats?.length && (
          <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">
            No chats found.
          </div>
        )}
      </div>
    </Section>
  );
}

