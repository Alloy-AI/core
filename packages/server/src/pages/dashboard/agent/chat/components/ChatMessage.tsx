import Icon from "@/src/lib/components/custom/Icon";
import MarkdownRenderer from "@/src/lib/components/custom/MarkdownRenderer";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
          message.isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/10 text-foreground border border-border/50"
        }`}
      >
        {message.isUser ? (
          <p className="whitespace-pre-wrap text-sm sm:text-base">
            {message.content}
          </p>
        ) : (
          <MarkdownRenderer
            content={message.content}
            className="text-sm sm:text-base"
          />
        )}
        <p className={`text-xs mt-1 opacity-70`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
