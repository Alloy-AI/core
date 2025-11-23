import {
  ArrowLeftIcon,
  ChatCircleTextIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  InfoIcon,
  PlugsConnectedIcon,
  PlusIcon,
  PuzzlePieceIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";
import { Separator } from "@/src/lib/components/ui/separator";
import { Switch } from "@/src/lib/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/lib/components/ui/tabs";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import {
  useAgent,
  useUpdateAgentPrompt,
  useAddTool,
  useRemoveTool,
  useToggleTool,
} from "@/src/lib/hooks/use-api";
import Layout from "../layout";

export default function AgentDetailsPage() {
  const { agentId } = useParams({ from: "/dashboard/agent/$agentId" });
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [toolLabel, setToolLabel] = useState("");
  const [toolKind, setToolKind] = useState<"builtin" | "mcp">("builtin");
  const [toolRef, setToolRef] = useState("");
  const [toolConfig, setToolConfig] = useState("{}");

  const {
    data: agent,
    isLoading,
    isError,
    error,
  } = useAgent(agentId || "");
  const { mutate: updatePrompt, isPending: isUpdatingPrompt } =
    useUpdateAgentPrompt();
  const { mutate: addTool, isPending: isAddingTool } = useAddTool();
  const { mutate: removeTool, isPending: isRemovingTool } = useRemoveTool();
  const { mutate: toggleTool, isPending: isTogglingTool } = useToggleTool();

  // Update prompt state when agent loads
  useEffect(() => {
    if (agent?.baseSystemPrompt) {
      setNewPrompt(agent.baseSystemPrompt);
    }
  }, [agent?.baseSystemPrompt]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (isError || !agent) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Agent not found
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The agent you are looking for does not exist."}
            </p>
            <Button asChild>
              <Link to="/dashboard/agents">Back to Agents</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {agent.name}
              </h1>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <span className="sr-only">Edit name</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Button>
            </div>
            <p className="text-muted-foreground">Manage your agent</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/agents">
                <ArrowLeftIcon className="mr-2 size-4" />
                Back to Agents
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/agent/$agentId/chat" params={{ agentId }}>
                <ChatCircleTextIcon className="mr-2 size-4" />
                Chat with Agent
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full space-y-6">
          <div className="w-full overflow-x-auto pb-2 -mb-2">
            <TabsList className="w-full sm:w-auto min-w-max justify-start bg-background/40 backdrop-blur-md border border-border p-1 h-auto flex-nowrap">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 px-4 py-2"
              >
                <InfoIcon className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="flex items-center gap-2 px-4 py-2"
              >
                <PuzzlePieceIcon className="size-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="flex items-center gap-2 px-4 py-2"
              >
                <PlugsConnectedIcon className="size-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="flex items-center gap-2 px-4 py-2"
              >
                <CodeIcon className="size-4" />
                API Specs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-background/40 backdrop-blur-md border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                  <InfoIcon className="size-5 text-primary" />
                  Agent Information
                </CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/50"
                  disabled
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete Agent
                </Button>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Agent ID
                    </Label>
                    <p className="font-medium text-foreground">{agent.id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Model
                    </Label>
                    <p className="font-medium text-foreground">
                      {agent.model || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Enabled Tools
                    </Label>
                    <p className="font-medium text-foreground">
                      {agent.tools?.filter((t) => t.enabled).length || 0} of{" "}
                      {agent.tools?.length || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Registration CID
                    </Label>
                    <p className="font-medium text-foreground font-mono text-xs break-all">
                      {agent.registrationPieceCid || "Not registered"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Base System Prompt
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        className="bg-muted/30 border-border text-foreground min-h-[100px] flex-1"
                        placeholder="You are a helpful assistant."
                      />
                      <Button
                        onClick={() =>
                          updatePrompt({
                            id: agentId!,
                            baseSystemPrompt: newPrompt,
                          })
                        }
                        disabled={isUpdatingPrompt || newPrompt === agent.baseSystemPrompt}
                        className="h-fit"
                      >
                        {isUpdatingPrompt ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="space-y-0.5">
                      <Label className="text-base text-foreground">
                        Search Enabled
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Web search capabilities
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-muted text-muted-foreground border-0"
                      >
                        Unavailable
                      </Badge>
                    </div>
                    <Switch
                      checked={searchEnabled}
                      onCheckedChange={setSearchEnabled}
                      disabled
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="space-y-0.5">
                      <Label className="text-base text-foreground">
                        Memory Enabled
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Conversation memory
                      </p>
                    </div>
                    <Switch
                      checked={memoryEnabled}
                      onCheckedChange={setMemoryEnabled}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <Card className="bg-background/40 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <PuzzlePieceIcon className="size-5 text-primary" />
                  Add New Tool
                </CardTitle>
                <CardDescription>
                  Add a builtin or MCP tool to your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm text-foreground">
                      Tool Label *
                    </Label>
                    <Input
                      value={toolLabel}
                      onChange={(e) => setToolLabel(e.target.value)}
                      placeholder="weather-api"
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-foreground">
                      Tool Kind *
                    </Label>
                    <Select
                      value={toolKind}
                      onValueChange={(v) =>
                        setToolKind(v as "builtin" | "mcp")
                      }
                    >
                      <SelectTrigger className="bg-muted/30 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="builtin">builtin</SelectItem>
                        <SelectItem value="mcp">mcp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-foreground">
                      Tool Ref *
                    </Label>
                    <Input
                      value={toolRef}
                      onChange={(e) => setToolRef(e.target.value)}
                      placeholder="weather-api"
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-foreground">
                      Tool Config (JSON)
                    </Label>
                    <Textarea
                      value={toolConfig}
                      onChange={(e) => setToolConfig(e.target.value)}
                      placeholder='{}'
                      className="bg-muted/30 border-border font-mono text-xs min-h-[60px]"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      let parsedConfig = {};
                      try {
                        parsedConfig = toolConfig.trim()
                          ? JSON.parse(toolConfig)
                          : {};
                      } catch {
                        toast.error("Invalid JSON config");
                        return;
                      }
                      addTool({
                        agentId: agentId!,
                        tool: {
                          label: toolLabel,
                          kind: toolKind,
                          ref: toolRef,
                          config: parsedConfig,
                        },
                      });
                      // Reset form
                      setToolLabel("");
                      setToolKind("builtin");
                      setToolRef("");
                      setToolConfig("{}");
                    }}
                    disabled={isAddingTool || !toolLabel || !toolRef}
                  >
                    {isAddingTool ? "Adding..." : "Add Tool"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Agent Tools
              </h3>
              {agent.tools && agent.tools.length > 0 ? (
                agent.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="bg-background/40 backdrop-blur-md border-border"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              tool.enabled ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              {tool.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {tool.kind} • {tool.ref}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleTool({
                                agentId: agentId!,
                                toolId: tool.id,
                              })
                            }
                            disabled={isTogglingTool}
                          >
                            {tool.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              removeTool({
                                agentId: agentId!,
                                toolId: tool.id,
                              })
                            }
                            disabled={isRemovingTool}
                          >
                            {isRemovingTool ? "Removing..." : "Remove"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-background/40 backdrop-blur-md border-border">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No tools added yet. Add your first tool above.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="space-y-4">
              {/* Telegram */}
              <Card className="bg-background/40 backdrop-blur-md border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#24A1DE] p-1.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path
                          d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"
                          opacity="0"
                        />
                        <path d="M9.879 15.121l-.564 5.564c.8 0 1.156-.364 1.564-.8l3.75-3.629 7.75 5.714c1.414.814 2.429.393 2.786-1.693l5.043-23.85c.514-2.021-1.95-2.807-5.307-1.55L1.579 11.571c-2.171.879-2.15 2.1.371 2.636l5.607 1.757 13.029-8.214c.614-.371 1.179-.171.714.243l-11.421 10.3z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">
                        Telegram Integration
                      </CardTitle>
                      <CardDescription>
                        Connect your agent to Telegram
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 flex items-start gap-3">
                    <WarningIcon className="size-5 text-chart-2 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-chart-2">
                        No Bot Configured
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set up your Telegram bot token to enable integration.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 border-border">
                    <PlusIcon className="mr-2 size-4" />
                    Configure Bot Token
                  </Button>
                </CardContent>
              </Card>

              {/* Discord */}
              <Card className="bg-background/40 backdrop-blur-md border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#5865F2] p-1.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.2915 18.2915 0 00-7.651 0 11.5116 11.5116 0 00-.6173-1.1588.0775.0775 0 00-.0785-.0371 19.7186 19.7186 0 00-4.8852 1.5152.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.0991.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">
                        Discord Integration
                      </CardTitle>
                      <CardDescription>
                        Connect your agent to Discord
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 flex items-start gap-3">
                    <WarningIcon className="size-5 text-chart-2 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-chart-2">
                        No Bot Configured
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set up your Discord bot token to enable integration.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 border-border">
                    <PlusIcon className="mr-2 size-4" />
                    Configure Bot Token
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Spec Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-background/40 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CodeIcon className="size-5 text-primary" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Use the following endpoint to interact with your agent via API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Endpoint
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-foreground rounded-md px-2 py-1 font-mono"
                    >
                      POST
                    </Badge>
                    <div className="flex-1 relative">
                      <Input
                        readOnly
                        value="https://pub.hetairoi.xyz/api/v1beta/openai/chat/completions"
                        className="bg-muted/30 border-border font-mono text-xs pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-muted/50"
                        onClick={() =>
                          copyToClipboard(
                            "https://pub.hetairoi.xyz/api/v1beta/openai/chat/completions",
                          )
                        }
                      >
                        {copied ? (
                          <CheckIcon className="size-3 text-green-400" />
                        ) : (
                          <CopyIcon className="size-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Required Headers
                  </Label>
                  <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                    <div className="grid grid-cols-3 p-3 border-b border-border text-xs font-medium text-muted-foreground bg-muted/50">
                      <div className="col-span-1">Header</div>
                      <div className="col-span-2">Value</div>
                    </div>
                    <div className="grid grid-cols-3 p-3 border-b border-border text-xs items-center">
                      <div className="col-span-1 font-mono text-foreground">
                        Authorization
                      </div>
                      <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                        <span>Bearer &lt;YOUR-API-KEY&gt;</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-muted/50"
                        >
                          <CopyIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 p-3 border-b border-border text-xs items-center">
                      <div className="col-span-1 font-mono text-foreground">
                        OpenAI-Organization
                      </div>
                      <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                        <span>org-f5150a6a6d154310bcd59dd0b5e71471</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-muted/50"
                        >
                          <CopyIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 p-3 text-xs items-center">
                      <div className="col-span-1 font-mono text-foreground">
                        OpenAI-Project
                      </div>
                      <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                        <span>proj-f48684f2a56d4c17860e6b1fc93c4329</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-muted/50"
                        >
                          <CopyIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Example Request Body (JSON)
                  </Label>
                  <div className="relative rounded-lg border border-border bg-muted/30 p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 hover:bg-muted/50"
                    >
                      <CopyIcon className="size-3 text-muted-foreground" />
                    </Button>
                    <pre className="font-mono text-xs text-muted-foreground overflow-x-auto">
                      {`{
  "model": "gemini-2.0-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
