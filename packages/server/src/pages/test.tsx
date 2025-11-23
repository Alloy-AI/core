import { useState } from "react";
import {
  useAgents,
  useAgent,
  useCreateAgent,
  useUpdateAgentPrompt,
  useChats,
  useChatHistory,
  useCreateChat,
  useSendMessage,
  useAddTool,
  useRemoveTool,
  useToggleTool,
} from "../lib/hooks/use-api";

import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-8 mb-8 last:border-0">
      <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function JsonPre({ data }: { data: unknown }) {
  if (!data)
    return <div className="text-xs text-muted-foreground italic">No data</div>;
  return (
    <pre className="text-[10px] bg-muted p-4 rounded-md overflow-auto max-h-40 font-mono border border-border text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function TestPage() {
  // Agents State
  const { data: agents, refetch: refetchAgents } = useAgents();
  const { mutate: createAgent } = useCreateAgent();
  const [newAgentName, setNewAgentName] = useState("Debug Agent");

  // Single Agent State
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const { data: agent } = useAgent(selectedAgentId);
  const { mutate: updatePrompt } = useUpdateAgentPrompt();
  const [newPrompt, setNewPrompt] = useState("You are a helpful assistant.");
  const { mutate: addTool } = useAddTool();
  const { mutate: removeTool } = useRemoveTool();
  const { mutate: toggleTool } = useToggleTool();

  // Chats State
  const { data: chats, refetch: refetchChats } = useChats();
  const { mutate: createChat } = useCreateChat();
  const [chatAgentId, setChatAgentId] = useState<string>("");

  // Chat Interaction State
  const [activeChatId, setActiveChatId] = useState("");
  const { data: history } = useChatHistory(activeChatId);
  const { mutate: sendMessage } = useSendMessage();
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">API Debugger</h1>
          <p className="text-muted-foreground">
            Test environment for packages/server/src/lib/hooks/use-api.ts
          </p>
        </div>

        {/* --- AGENTS LIST & CREATION --- */}
        <Section title="1. Agents">
          <div className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <label
                htmlFor="newAgentName"
                className="text-xs font-medium text-muted-foreground"
              >
                New Agent Name
              </label>
              <Input
                id="newAgentName"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="h-9 text-sm bg-background border-input"
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                createAgent({
                  name: newAgentName,
                  description: "Created via debugger",
                  model: "gpt-4",
                  baseSystemPrompt: "You are a helper.",
                  chains: [11155111],
                })
              }
              className="h-9"
            >
              Create Agent
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchAgents()}
              className="h-9"
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 pt-4">
            {agents?.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-md text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-card-foreground">
                  {a.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({a.id})
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => setSelectedAgentId(a.id)}
                >
                  Select
                </Button>
              </div>
            ))}
            {!agents?.length && (
              <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">
                No agents found. Create one to get started.
              </div>
            )}
          </div>
        </Section>

        {/* --- SELECTED AGENT DETAILS --- */}
        <Section title="2. Selected Agent">
          <div className="flex gap-4 items-end mb-6">
            <div className="grid gap-2 flex-1">
              <label
                htmlFor="agentId"
                className="text-xs font-medium text-muted-foreground"
              >
                Agent ID
              </label>
              <Input
                id="agentId"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="h-9 text-sm bg-background border-input"
                placeholder="Select an agent above..."
              />
            </div>
          </div>

          {agent ? (
            <div className="space-y-6">
              <JsonPre data={agent} />

              <div className="grid gap-2">
                <label
                  htmlFor="newPrompt"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Update System Prompt
                </label>
                <div className="flex gap-2 items-start">
                  <Textarea
                    id="newPrompt"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="text-sm min-h-[80px] bg-background border-input flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      updatePrompt({
                        id: selectedAgentId,
                        baseSystemPrompt: newPrompt,
                      })
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">Tools</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addTool({
                        agentId: selectedAgentId,
                        tool: {
                          label: "Test Tool " + Math.floor(Math.random() * 100),
                          kind: "builtin",
                          ref: "weather-api",
                          config: {},
                        },
                      })
                    }
                  >
                    Add Test Tool
                  </Button>
                </div>

                <div className="space-y-2">
                  {agent.tools?.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-2 bg-muted/30 border border-border rounded-md text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            tool.enabled ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ({tool.kind})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() =>
                            toggleTool({
                              agentId: selectedAgentId,
                              toolId: tool.id,
                            })
                          }
                        >
                          {tool.enabled ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() =>
                            removeTool({
                              agentId: selectedAgentId,
                              toolId: tool.id,
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!agent.tools?.length && (
                    <div className="text-xs text-muted-foreground italic">
                      No tools added.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-md text-center">
              No agent selected or agent not found.
            </div>
          )}
        </Section>

        {/* --- CHATS LIST & CREATION --- */}
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
              className="h-9"
            >
              Create Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchChats()}
              className="h-9"
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 mt-4">
            {chats?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-md text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="text-card-foreground">
                  Chat {c.id.slice(0, 8)}...{" "}
                  <span className="text-muted-foreground text-xs ml-2">
                    ({new Date(c.createdAt).toLocaleTimeString()})
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => setActiveChatId(c.id)}
                >
                  Open
                </Button>
              </div>
            ))}
            {!chats?.length && (
              <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">
                No chats found.
              </div>
            )}
          </div>
        </Section>

        {/* --- ACTIVE CHAT INTERACTION --- */}
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
              onChange={(e) => setActiveChatId(e.target.value)}
              className="h-9 text-sm mt-2 bg-background border-input"
              placeholder="Select a chat above..."
            />
          </div>

          {activeChatId ? (
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-muted/30">
                {history?.length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    No messages yet. Start the conversation.
                  </div>
                )}
                {history?.map((msg) => (
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
                    if (e.key === "Enter") {
                      sendMessage({ chatId: activeChatId, content: message });
                      setMessage("");
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-background"
                />
                <Button
                  onClick={() => {
                    sendMessage({ chatId: activeChatId, content: message });
                    setMessage("");
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic p-8 border border-dashed border-border rounded-md text-center">
              Select a chat to start messaging.
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
