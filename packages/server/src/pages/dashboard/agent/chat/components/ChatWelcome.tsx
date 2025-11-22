import Icon from "@/src/lib/components/custom/Icon";
import { Card, CardDescription } from "@/src/lib/components/ui/card";

interface ChatWelcomeProps {
  agentName: string;
  onPromptClick: (prompt: string) => void;
}

export default function ChatWelcome({
  agentName,
  onPromptClick,
}: ChatWelcomeProps) {
  const suggestedPrompts = [
    {
      text: "Hello! Can you help me understand what you can do?",
      label: "Ask about capabilities",
    },
    {
      text: "What kind of tasks are you best at?",
      label: "Explore use cases",
    },
    {
      text: "Can you show me some examples of your work?",
      label: "See examples",
    },
    {
      text: "How can I get the most out of our conversation?",
      label: "Get tips",
    },
  ];

  return (
    <div className="text-center h-full py-12 sm:py-20 space-y-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <Icon
          name="BotMessageSquare"
          className="size-6 sm:size-8 text-primary"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-medium">Start a conversation</h3>
        <p className="text-muted-foreground max-w-md mx-auto px-4">
          Type a message below to begin chatting with {agentName}.
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-6 sm:mt-8 px-4">
        {suggestedPrompts.map((prompt, index) => (
          <Card
            key={index}
            className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow border-border/50"
            onClick={() => onPromptClick(prompt.text)}
          >
            <CardDescription className="text-center text-sm">
              {prompt.label}
            </CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
