import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  RobotIcon,
} from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/src/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/lib/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/lib/components/ui/form";
import { Input } from "@/src/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { useCreateAgent } from "@/src/lib/hooks/use-api";

// Supported chains based on evm.ts - for ERC-8004 registry registration
export const SUPPORTED_CHAINS = [
  { id: 11155111, label: "Ethereum Sepolia", value: "11155111" },
  { id: 84532, label: "Base Sepolia", value: "84532" },
  { id: 80002, label: "Polygon Amoy", value: "80002" },
] as const;

// Define the schema for the agent form - matches server validation
const agentFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Name must be at least 3 characters.",
    })
    .max(100, {
      message: "Name must be at most 100 characters.",
    }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must be at most 500 characters.",
    }),
  model: z
    .string()
    .min(3, {
      message: "Model must be at least 3 characters.",
    })
    .max(100, {
      message: "Model must be at most 100 characters.",
    }),
  baseSystemPrompt: z
    .string()
    .min(10, {
      message: "Base system prompt must be at least 10 characters.",
    })
    .max(1000, {
      message: "Base system prompt must be at most 1000 characters.",
    }),
  registryChain: z.string().min(1, {
    message: "Registry chain is required.",
  }),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const { mutate: createAgent, isPending } = useCreateAgent();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "",
      baseSystemPrompt: "You are a helpful assistant designed to assist users with their tasks and questions.",
      registryChain: "11155111", // Default registry chain for ERC-8004 registration
    },
  });

  function onSubmit(data: AgentFormValues) {
    // Use registryChain for the chains array (agent operates on all chains, but registers on selected one)
    const registryChainId = Number(data.registryChain);
    createAgent(
      {
        name: data.name,
        description: data.description,
        model: data.model,
        baseSystemPrompt: data.baseSystemPrompt,
        chains: [registryChainId], // Registry chain for ERC-8004 registration
      },
      {
        onSuccess: () => {
          setShowSuccessDialog(true);
        },
      },
    );
  }

  const handleGoToAgents = () => {
    setShowSuccessDialog(false);
    navigate({
      to: "/dashboard/agents",
    });
  };

  return (
    <div className="w-full flex justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-4 my-8 relative pt-8 md:pt-0">
        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground hover:text-foreground pl-0 gap-2"
        >
          <Link to="/dashboard/agents">
            <ArrowLeftIcon className="size-4" />
            Back to Agents
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Create New Agent
          </h1>
          <p className="text-muted-foreground">
            Configure your new autonomous agent.
          </p>
        </div>

        <Card className="bg-background/40 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <RobotIcon className="size-5 text-primary" weight="fill" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Arbitrage Bot"
                          {...field}
                          className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        This is the public display name of your agent.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Description *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe what this agent does..."
                          {...field}
                          className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Model *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-border text-foreground focus:ring-primary">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseSystemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Base System Prompt *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="You are a helpful assistant."
                          className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the agent's personality and behavior.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registryChain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        ERC-8004 Registry Chain *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-border text-foreground focus:ring-primary cursor-pointer min-h-[60px] py-3">
                            <SelectValue placeholder="Select registry chain">
                              {field.value ? (
                                <div className="flex flex-col items-start text-left w-full">
                                  <span className="font-medium text-sm">
                                    {
                                      SUPPORTED_CHAINS.find(
                                        (c) => c.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    Chain ID:{" "}
                                    {
                                      SUPPORTED_CHAINS.find(
                                        (c) => c.value === field.value,
                                      )?.id
                                    }
                                  </span>
                                </div>
                              ) : (
                                "Select registry chain"
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          {SUPPORTED_CHAINS.map((chain) => (
                            <SelectItem
                              key={chain.id}
                              value={chain.value}
                              className="cursor-pointer py-3"
                            >
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="font-medium text-sm">
                                  {chain.label}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  Chain ID: {chain.id}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the chain for ERC-8004 registry registration. The
                        agent will operate on all supported chains.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Create Agent"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircleIcon
                  className="size-6 text-primary"
                  weight="fill"
                />
              </div>
              <div>
                <DialogTitle className="text-left">
                  Agent Creation Queued
                </DialogTitle>
                <DialogDescription className="text-left mt-1">
                  Your agent creation has been queued on the blockchain and it
                  will be ready to use within minutes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button onClick={handleGoToAgents} className="w-full sm:w-auto">
              Go to Agents Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
