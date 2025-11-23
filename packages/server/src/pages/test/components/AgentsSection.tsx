import { useState } from "react";
import { useAgents, useCreateAgent } from "../../../lib/hooks/use-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";
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
  const [newAgentDescription, setNewAgentDescription] = useState("Created via debugger");
  const [newAgentModel, setNewAgentModel] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("You are a helper.");
  const [newAgentChains, setNewAgentChains] = useState("11155111");

  const handleCreateAgent = () => {
    const chainsArray = newAgentChains
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "")
      .map((c) => Number(c))
      .filter((n) => !Number.isNaN(n));

    createAgent({
      name: newAgentName,
      description: newAgentDescription,
      model: newAgentModel,
      baseSystemPrompt: newAgentPrompt,
      chains: chainsArray,
    });
  };

  return (
    <Section title="1. Agents">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="newAgentName"
              className="text-xs font-medium text-muted-foreground"
            >
              Agent Name *
            </label>
            <Input
              id="newAgentName"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="h-9 text-sm bg-background border-input"
              placeholder="Debug Agent"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="newAgentDescription"
              className="text-xs font-medium text-muted-foreground"
            >
              Description *
            </label>
            <Input
              id="newAgentDescription"
              value={newAgentDescription}
              onChange={(e) => setNewAgentDescription(e.target.value)}
              className="h-9 text-sm bg-background border-input"
              placeholder="Created via debugger"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="newAgentModel"
              className="text-xs font-medium text-muted-foreground"
            >
              Model *
            </label>
            <Select
              value={newAgentModel}
              onValueChange={setNewAgentModel}
            >
              <SelectTrigger
                id="newAgentModel"
                className="h-9 text-sm bg-background border-input"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama-3.1-8b-instant">
                  llama-3.1-8b-instant
                </SelectItem>
                <SelectItem value="llama-3.3-70b-versatile">
                  llama-3.3-70b-versatile
                </SelectItem>
                <SelectItem value="openai/gpt-oss-120b">
                  openai/gpt-oss-120b
                </SelectItem>
                <SelectItem value="openai/gpt-oss-20b">
                  openai/gpt-oss-20b
                </SelectItem>
                <SelectItem value="moonshotai/kimi-k2-instruct-0905">
                  moonshotai/kimi-k2-instruct-0905
                </SelectItem>
                <SelectItem value="qwen/qwen3-32b">
                  qwen/qwen3-32b
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="newAgentPrompt"
              className="text-xs font-medium text-muted-foreground"
            >
              Base System Prompt *
            </label>
            <Textarea
              id="newAgentPrompt"
              value={newAgentPrompt}
              onChange={(e) => setNewAgentPrompt(e.target.value)}
              className="text-sm min-h-[80px] bg-background border-input"
              placeholder="You are a helpful assistant."
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="newAgentChains"
              className="text-xs font-medium text-muted-foreground"
            >
              Chain IDs (comma-separated) *
            </label>
            <Input
              id="newAgentChains"
              value={newAgentChains}
              onChange={(e) => setNewAgentChains(e.target.value)}
              className="h-9 text-sm bg-background border-input"
              placeholder="e.g., 11155111, 1, 137"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleCreateAgent}
            disabled={isCreatingAgent || !newAgentName || !newAgentDescription || !newAgentModel || !newAgentPrompt || !newAgentChains}
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

