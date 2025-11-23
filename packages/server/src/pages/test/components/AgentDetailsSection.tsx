import { useState } from "react";
import {
  useAgent,
  useUpdateAgentPrompt,
  useAddTool,
  useRemoveTool,
  useToggleTool,
} from "../../../lib/hooks/use-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Section } from "./Section";
import { JsonPre } from "./JsonPre";

interface AgentDetailsSectionProps {
  selectedAgentId: string;
  onAgentIdChange: (agentId: string) => void;
}

export function AgentDetailsSection({
  selectedAgentId,
  onAgentIdChange,
}: AgentDetailsSectionProps) {
  const {
    data: agent,
    isLoading: isLoadingAgent,
    isError: isErrorAgent,
    error: errorAgent,
  } = useAgent(selectedAgentId);
  const {
    mutate: updatePrompt,
    isPending: isUpdatingPrompt,
  } = useUpdateAgentPrompt();
  const [newPrompt, setNewPrompt] = useState("You are a helpful assistant.");
  const { mutate: addTool, isPending: isAddingTool } = useAddTool();
  const [toolLabel, setToolLabel] = useState("weather-api");
  const [toolKind, setToolKind] = useState<"builtin" | "mcp">("builtin");
  const [toolRef, setToolRef] = useState("weather-api");
  const [toolConfig, setToolConfig] = useState("{}");
  const { mutate: removeTool, isPending: isRemovingTool } = useRemoveTool();
  const { mutate: toggleTool, isPending: isTogglingTool } = useToggleTool();

  return (
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
            onChange={(e) => onAgentIdChange(e.target.value)}
            className="h-9 text-sm bg-background border-input"
            placeholder="Select an agent above..."
          />
        </div>
      </div>

      {isLoadingAgent && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {isErrorAgent && (
        <div className="text-sm text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
          <div className="font-medium mb-1">Error loading agent:</div>
          <div className="text-xs">
            {errorAgent instanceof Error
              ? errorAgent.message
              : "Unknown error"}
          </div>
        </div>
      )}
      {!isLoadingAgent && !isErrorAgent && agent ? (
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
                placeholder="You are a helpful assistant."
              />
              <Button
                size="sm"
                onClick={() =>
                  updatePrompt({
                    id: selectedAgentId,
                    baseSystemPrompt: newPrompt,
                  })
                }
                disabled={isUpdatingPrompt}
              >
                {isUpdatingPrompt ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground mb-4">Tools</h3>
              <div className="grid gap-4 p-4 bg-muted/30 border border-border rounded-md">
                <div className="grid gap-2">
                  <label
                    htmlFor="toolLabel"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Tool Label *
                  </label>
                  <Input
                    id="toolLabel"
                    value={toolLabel}
                    onChange={(e) => setToolLabel(e.target.value)}
                    className="h-9 text-sm bg-background border-input"
                    placeholder="weather-api"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="toolKind"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Tool Kind *
                  </label>
                  <select
                    id="toolKind"
                    value={toolKind}
                    onChange={(e) => setToolKind(e.target.value as "builtin" | "mcp")}
                    className="h-9 text-sm bg-background border border-input rounded-md px-3"
                  >
                    <option value="builtin">builtin</option>
                    <option value="mcp">mcp</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="toolRef"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Tool Ref *
                  </label>
                  <Input
                    id="toolRef"
                    value={toolRef}
                    onChange={(e) => setToolRef(e.target.value)}
                    className="h-9 text-sm bg-background border-input"
                    placeholder="weather-api"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="toolConfig"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Tool Config (JSON)
                  </label>
                  <Textarea
                    id="toolConfig"
                    value={toolConfig}
                    onChange={(e) => setToolConfig(e.target.value)}
                    className="text-xs min-h-[60px] bg-background border-input font-mono"
                    placeholder='{}'
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    let parsedConfig = {};
                    try {
                      parsedConfig = toolConfig.trim() ? JSON.parse(toolConfig) : {};
                    } catch {
                      alert("Invalid JSON config. Using empty object.");
                    }
                    addTool({
                      agentId: selectedAgentId,
                      tool: {
                        label: toolLabel,
                        kind: toolKind,
                        ref: toolRef,
                        config: parsedConfig,
                      },
                    });
                    // Reset form
                    setToolLabel("weather-api");
                    setToolKind("builtin");
                    setToolRef("weather-api");
                    setToolConfig("{}");
                  }}
                  disabled={isAddingTool || !toolLabel || !toolRef}
                >
                  {isAddingTool ? "Adding..." : "Add Tool"}
                </Button>
              </div>
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
                      disabled={isTogglingTool}
                    >
                      {isTogglingTool
                        ? "..."
                        : tool.enabled
                          ? "Disable"
                          : "Enable"}
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
                      disabled={isRemovingTool}
                    >
                      {isRemovingTool ? "Removing..." : "Remove"}
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
      ) : !isLoadingAgent && !isErrorAgent ? (
        <div className="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-md text-center">
          No agent selected or agent not found.
        </div>
      ) : null}
    </Section>
  );
}

