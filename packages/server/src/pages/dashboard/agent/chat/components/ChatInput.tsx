import { useState } from "react";
import Icon from "@/src/lib/components/custom/Icon";
import { Button } from "@/src/lib/components/ui/button";
import { Textarea } from "@/src/lib/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function ChatInput({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-border/50 pt-4 pb-2 bg-background">
      <div className="flex gap-2 sm:gap-3 px-6">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm sm:text-base"
          disabled={disabled || isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading || disabled}
          size="lg"
          className="self-end px-3 sm:px-4"
        >
          {isLoading ? (
            <Icon name="Loader" className="size-4 animate-spin" />
          ) : (
            <Icon name="Send" className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
