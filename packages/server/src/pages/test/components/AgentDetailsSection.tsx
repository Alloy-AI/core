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
                disabled={isAddingTool}
              >
                {isAddingTool ? "Adding..." : "Add Test Tool"}
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

