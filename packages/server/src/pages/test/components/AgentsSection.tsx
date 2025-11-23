import { useState } from "react";
import { useAgents, useCreateAgent } from "../../../lib/hooks/use-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Section } from "./Section";

interface AgentsSectionProps {
  onSelectAgent: (agentId: string) => void;
}

export function AgentsSection({ onSelectAgent }: AgentsSectionProps) {
  const {
    data: agents,
    isLoading: isLoadingAgents,
    isError: isErrorAgents,
    error: errorAgents,
    refetch: refetchAgents,
  } = useAgents();
  const {
    mutate: createAgent,
    isPending: isCreatingAgent,
  } = useCreateAgent();
  const [newAgentName, setNewAgentName] = useState("Debug Agent");

  return (
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
          disabled={isCreatingAgent}
          className="h-9"
        >
          {isCreatingAgent ? "Creating..." : "Create Agent"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetchAgents()}
          disabled={isLoadingAgents}
          className="h-9"
        >
          {isLoadingAgents ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-2 pt-4">
        {isLoadingAgents && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {isErrorAgents && (
          <div className="text-sm text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
            <div className="font-medium mb-1">Error loading agents:</div>
            <div className="text-xs">
              {errorAgents instanceof Error
                ? errorAgents.message
                : "Unknown error"}
            </div>
          </div>
        )}
        {!isLoadingAgents && !isErrorAgents && agents?.map((a) => (
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
              onClick={() => onSelectAgent(a.id)}
            >
              Select
            </Button>
          </div>
        ))}
        {!isLoadingAgents && !isErrorAgents && !agents?.length && (
          <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-md">
            No agents found. Create one to get started.
          </div>
        )}
      </div>
    </Section>
  );
}

