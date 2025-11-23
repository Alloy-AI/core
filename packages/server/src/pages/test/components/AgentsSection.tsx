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

// Supported chains based on evm.ts - for ERC-8004 registry registration
const SUPPORTED_CHAINS = [
  { id: 11155111, label: "Ethereum Sepolia", value: "11155111" },
  { id: 84532, label: "Base Sepolia", value: "84532" },
  { id: 80002, label: "Polygon Amoy", value: "80002" },
] as const;

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
  const [newAgentRegistryChain, setNewAgentRegistryChain] = useState("11155111");

  const handleCreateAgent = () => {
    if (!newAgentRegistryChain) {
      alert("Please select a registry chain");
      return;
    }

    createAgent({
      name: newAgentName,
      description: newAgentDescription,
      model: newAgentModel,
      baseSystemPrompt: newAgentPrompt,
      chains: [Number(newAgentRegistryChain)], // Registry chain for ERC-8004 registration
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
              htmlFor="newAgentRegistryChain"
              className="text-xs font-medium text-muted-foreground"
            >
              ERC-8004 Registry Chain *
            </label>
            <Select
              value={newAgentRegistryChain}
              onValueChange={setNewAgentRegistryChain}
            >
              <SelectTrigger
                id="newAgentRegistryChain"
                className="h-auto min-h-[60px] py-3 text-sm bg-background border-input cursor-pointer"
              >
                <SelectValue placeholder="Select registry chain">
                  {newAgentRegistryChain ? (
                    <div className="flex flex-col items-start text-left w-full">
                      <span className="font-medium text-sm">
                        {SUPPORTED_CHAINS.find((c) => c.value === newAgentRegistryChain)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Chain ID: {SUPPORTED_CHAINS.find((c) => c.value === newAgentRegistryChain)?.id}
                      </span>
                    </div>
                  ) : (
                    "Select registry chain"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem
                    key={chain.id}
                    value={chain.value}
                    className="cursor-pointer py-3"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-medium text-sm">{chain.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Chain ID: {chain.id}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the chain for ERC-8004 registry registration. The agent will operate on all supported chains.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleCreateAgent}
            disabled={isCreatingAgent || !newAgentName || !newAgentDescription || !newAgentModel || !newAgentPrompt || !newAgentRegistryChain}
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

