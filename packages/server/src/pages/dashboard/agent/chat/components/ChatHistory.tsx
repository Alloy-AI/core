import { useState } from "react";
import Icon from "@/src/lib/components/custom/Icon";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import { Separator } from "@/src/lib/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/lib/components/ui/sheet";

interface ChatHistoryProps {
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
  }[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export default function ChatHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Sort conversations by timestamp (latest first)
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Icon name="GalleryVerticalEnd" className="size-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <SheetTitle className="text-lg font-semibold">
                Chat History
              </SheetTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Your previous conversations
            </p>
          </div>

          {/* New Conversation Button */}
          <div className="flex-shrink-0 p-6 pb-4">
            <Button
              onClick={() => {
                onNewConversation();
                setIsOpen(false);
              }}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Icon name="Plus" className="size-4 mr-2" />
              New Chat
            </Button>
          </div>

          <Separator className="mx-6" />

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {sortedConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Icon
                    name="MessageSquare"
                    className="size-8 text-muted-foreground"
                  />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Start a new conversation to see your chat history here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      setIsOpen(false);
                    }}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentConversationId === conversation.id
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-muted/60 border border-transparent hover:border-border/50"
                    }`}
                  >
                    {/* Active indicator */}
                    {currentConversationId === conversation.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Conversation icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          currentConversationId === conversation.id
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                        }`}
                      >
                        <Icon name="MessageSquare" className="size-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`font-medium text-sm truncate ${
                              currentConversationId === conversation.id
                                ? "text-foreground"
                                : "text-foreground group-hover:text-foreground"
                            }`}
                          >
                            {conversation.title}
                          </h4>
                        </div>

                        <p className="text-xs text-muted-foreground truncate mb-1 leading-relaxed">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
