import { useState } from "react";
import { AgentsSection } from "./components/AgentsSection";
import { AgentDetailsSection } from "./components/AgentDetailsSection";
import { ChatsSection } from "./components/ChatsSection";
import { ChatInteractionSection } from "./components/ChatInteractionSection";

export default function TestPage() {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [activeChatId, setActiveChatId] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">API Debugger</h1>
          <p className="text-muted-foreground">
            Test environment for packages/server/src/lib/hooks/use-api.ts
          </p>
        </div>

        <AgentsSection onSelectAgent={setSelectedAgentId} />
        <AgentDetailsSection
          selectedAgentId={selectedAgentId}
          onAgentIdChange={setSelectedAgentId}
        />
        <ChatsSection
          selectedAgentId={selectedAgentId}
          onSelectChat={setActiveChatId}
        />
        <ChatInteractionSection
          activeChatId={activeChatId}
          selectedAgentId={selectedAgentId}
          onChatIdChange={setActiveChatId}
        />
      </div>
    </div>
  );
}
