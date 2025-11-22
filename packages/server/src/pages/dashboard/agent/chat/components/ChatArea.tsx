import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatLoading from "./ChatLoading";
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
}

export default function ChatArea({
  messages,
  isLoading,
  agentName,
  onPromptClick
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 py-4 sm:py-6 space-y-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full">
          <ChatWelcome agentName={agentName} onPromptClick={onPromptClick} />
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}

      {isLoading && <ChatLoading />}

      <div ref={messagesEndRef} />
    </div>
  );
} 