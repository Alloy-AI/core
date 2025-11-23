import { useEffect, useRef } from "react";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";
import ChatWelcome from "./ChatWelcome";

interface ChatAreaProps {
  messages: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  }[];
  isLoading: boolean;
  agentName: string;
  onPromptClick: (prompt: string) => void;
  pendingMessage?: string | null;
}

export default function ChatArea({
  messages,
  isLoading,
  agentName,
  onPromptClick,
  pendingMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingMessage]);

  return (
    <div className="flex-1 py-4 sm:py-6 space-y-4 overflow-y-auto">
      {messages.length === 0 && !pendingMessage ? (
        <div className="h-full">
          <ChatWelcome agentName={agentName} onPromptClick={onPromptClick} />
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {pendingMessage && (
            <ChatMessage
              message={{
                id: "pending-message",
                content: pendingMessage,
                isUser: true,
                timestamp: new Date(),
              }}
            />
          )}
        </>
      )}

      {isLoading && <ChatLoading />}

      <div ref={messagesEndRef} />
    </div>
  );
}
