import Layout from "../layout";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Switch } from "@/src/lib/components/ui/switch";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Link, useParams } from "@tanstack/react-router";
import { 
    ArrowLeftIcon, 
    ChatCircleTextIcon, 
    TrashIcon, 
    InfoIcon, 
    PuzzlePieceIcon, 
    CodeIcon, 
    PlugsConnectedIcon, 
    WarningIcon, 
    PlusIcon,
    MagnifyingGlassIcon,
    CopyIcon,
    CheckIcon
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { mockAgents, mockExtensions } from "@/src/lib/mock";

export default function AgentDetailsPage() {
    const { agentId } = useParams({ from: '/dashboard/agent/$agentId' });
    const [searchEnabled, setSearchEnabled] = useState(false);
    const [memoryEnabled, setMemoryEnabled] = useState(false);
    const [copied, setCopied] = useState(false);

    const agent = mockAgents.find(a => a.id === agentId);
    const agentExtensions = mockExtensions; // For now, show all extensions or filter if needed

    if (!agent) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Agent not found</h2>
                        <p className="text-muted-foreground">The agent you are looking for does not exist.</p>
                        <Button asChild>
                            <Link to="/agents">Back to Agents</Link>
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
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{agent.name}</h1>
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
                            <Link to="/agents">
                                <ArrowLeftIcon className="mr-2 size-4" />
                                Back to Agents
                            </Link>
                        </Button>
                        <Button variant="outline">
                            <ChatCircleTextIcon className="mr-2 size-4" />
                            Chat with Agent
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full space-y-6">
                    <TabsList className="w-full justify-start bg-background/40 backdrop-blur-md border border-border p-1 h-auto">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2">
                            <InfoIcon className="size-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="extensions" className="flex items-center gap-2 px-4 py-2">
                            <PuzzlePieceIcon className="size-4" />
                            Extensions
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="flex items-center gap-2 px-4 py-2">
                            <PlugsConnectedIcon className="size-4" />
                            Integrations
                        </TabsTrigger>
                        <TabsTrigger value="api" className="flex items-center gap-2 px-4 py-2">
                            <CodeIcon className="size-4" />
                            API Specs
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card className="bg-background/40 backdrop-blur-md border-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                                    <InfoIcon className="size-5 text-primary" />
                                    Agent Information
                                </CardTitle>
                                <Button variant="destructive" size="sm" className="bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/50">
                                    <TrashIcon className="mr-2 size-4" />
                                    Delete Agent
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Project ID</Label>
                                        <p className="font-medium text-foreground">{agent.id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Created</Label>
                                        <p className="font-medium text-foreground">{agent.created}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Enabled Extensions</Label>
                                        <p className="font-medium text-foreground">{agent.extensions.length} of {mockExtensions.length}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Default Model</Label>
                                        <Select defaultValue="gemini-2.0-flash">
                                            <SelectTrigger className="h-8 w-full bg-muted/30 border-border">
                                                <SelectValue placeholder="Select model" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background/90 border-border">
                                                <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                                                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="bg-border" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                                        <div className="space-y-0.5">
                                            <Label className="text-base text-foreground">Search Enabled</Label>
                                            <p className="text-xs text-muted-foreground">Web search capabilities</p>
                                            <Badge variant="secondary" className="mt-1 bg-muted text-muted-foreground border-0">Unavailable</Badge>
                                        </div>
                                        <Switch 
                                            checked={searchEnabled} 
                                            onCheckedChange={setSearchEnabled} 
                                            disabled
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                                        <div className="space-y-0.5">
                                            <Label className="text-base text-foreground">Memory Enabled</Label>
                                            <p className="text-xs text-muted-foreground">Conversation memory</p>
                                        </div>
                                        <Switch 
                                            checked={memoryEnabled} 
                                            onCheckedChange={setMemoryEnabled}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Extensions Tab */}
                    <TabsContent value="extensions" className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative w-full md:w-96">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input placeholder="Search products..." className="pl-9 bg-background/40 border-border" />
                            </div>
                            <div className="flex gap-2">
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[160px] bg-background/40 border-border">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/90 border-border">
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="knowledge">Knowledge</SelectItem>
                                        <SelectItem value="tools">Tools</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px] bg-background/40 border-border">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/90 border-border">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="enabled">Enabled</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Extensions Grid */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {agentExtensions.map((extension) => (
                                <Card key={extension.id} className="bg-background/40 backdrop-blur-md border-border hover:bg-muted/20 transition-all cursor-pointer group h-full">
                                    <CardContent className="p-6 h-full">
                                        <div className="flex flex-col gap-4 h-full">
                                            <div className="flex justify-between items-start w-full">
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center shrink-0">
                                                    <PuzzlePieceIcon className="size-6 text-primary" weight="fill" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={agent.extensions.includes(extension.id)} className="scale-75" />
                                                    {agent.extensions.includes(extension.id) && (
                                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                                            <CheckIcon className="size-3" />
                                                            Enabled
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                        {extension.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Product ID: {extension.productId}</p>
                                                <Badge variant="secondary" className="mt-2 bg-muted text-muted-foreground border-0">
                                                    {extension.category}
                                                </Badge>
                                            </div>

                                            <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {/* No price needed as requested */}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <span>{extension.created}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z" opacity="0"/><path d="M9.879 15.121l-.564 5.564c.8 0 1.156-.364 1.564-.8l3.75-3.629 7.75 5.714c1.414.814 2.429.393 2.786-1.693l5.043-23.85c.514-2.021-1.95-2.807-5.307-1.55L1.579 11.571c-2.171.879-2.15 2.1.371 2.636l5.607 1.757 13.029-8.214c.614-.371 1.179-.171.714.243l-11.421 10.3z"/></svg>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-foreground">Telegram Integration</CardTitle>
                                            <CardDescription>Connect your agent to Telegram</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 flex items-start gap-3">
                                        <WarningIcon className="size-5 text-chart-2 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-chart-2">No Bot Configured</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Set up your Telegram bot token to enable integration.</p>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.2915 18.2915 0 00-7.651 0 11.5116 11.5116 0 00-.6173-1.1588.0775.0775 0 00-.0785-.0371 19.7186 19.7186 0 00-4.8852 1.5152.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.0991.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-foreground">Discord Integration</CardTitle>
                                            <CardDescription>Connect your agent to Discord</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 flex items-start gap-3">
                                        <WarningIcon className="size-5 text-chart-2 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-chart-2">No Bot Configured</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Set up your Discord bot token to enable integration.</p>
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
                                <CardDescription>Use the following endpoint to interact with your agent via API</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Endpoint</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-muted text-foreground rounded-md px-2 py-1 font-mono">POST</Badge>
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
                                                onClick={() => copyToClipboard("https://pub.hetairoi.xyz/api/v1beta/openai/chat/completions")}
                                            >
                                                {copied ? <CheckIcon className="size-3 text-green-400" /> : <CopyIcon className="size-3 text-muted-foreground" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Required Headers</Label>
                                    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                                        <div className="grid grid-cols-3 p-3 border-b border-border text-xs font-medium text-muted-foreground bg-muted/50">
                                            <div className="col-span-1">Header</div>
                                            <div className="col-span-2">Value</div>
                                        </div>
                                        <div className="grid grid-cols-3 p-3 border-b border-border text-xs items-center">
                                            <div className="col-span-1 font-mono text-foreground">Authorization</div>
                                            <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                                                <span>Bearer &lt;YOUR-API-KEY&gt;</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted/50">
                                                    <CopyIcon className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 p-3 border-b border-border text-xs items-center">
                                            <div className="col-span-1 font-mono text-foreground">OpenAI-Organization</div>
                                            <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                                                <span>org-f5150a6a6d154310bcd59dd0b5e71471</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted/50">
                                                    <CopyIcon className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 p-3 text-xs items-center">
                                            <div className="col-span-1 font-mono text-foreground">OpenAI-Project</div>
                                            <div className="col-span-2 font-mono text-muted-foreground flex justify-between items-center">
                                                <span>proj-f48684f2a56d4c17860e6b1fc93c4329</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted/50">
                                                    <CopyIcon className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Example Request Body (JSON)</Label>
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
