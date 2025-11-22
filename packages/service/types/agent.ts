export interface IAgent {
    generateResponse(args: { message: string, chatId?: string }): Promise<string>;
    registerNewChat(): Promise<string>;
    getChatInformation(args: { chatId: string }): Promise<AgentDescriptor>;
    updateBaseSystemPrompt(args: { newPrompt: string }): Promise<void>;

    addSystemPromptSnippet(args: { label: string, text: string }): Promise<string>;
    removeSystemPromptSnippet(args: { snippetId: string }): Promise<void>;
    toggleSystemPromptSnippet(args: { snippetId: string }): Promise<void>;

    addTool(args: { label: string, kind: "builtin" | "mcp", ref: string, config?: Record<string, any> }): Promise<string>;
    removeTool(args: { toolId: string }): Promise<void>;
    toggleTool(args: { toolId: string }): Promise<void>;

    addMCPServer(args: { name: string, transport: "stdio" | "websocket" | "custom", connectionInfo: any }): Promise<string>;
    removeMCPServer(args: { serverId: string }): Promise<void>;
    toggleMCPServer(args: { serverId: string }): Promise<void>;
}

type AgentDescriptor = {
    id: string;
    name: string;

    baseSystemPrompt: string;

    systemPromptSnippets: {
        id: string;
        label: string;
        text: string;
        enabled: boolean;
    }[];

    tools: {
        id: string;
        label: string;
        kind: "builtin" | "mcp";
        ref: string;
        enabled: boolean;
        config?: Record<string, any>;
    }[];

    mcpServers: {
        id: string;
        name: string;
        transport: "stdio" | "websocket" | "custom";
        connectionInfo: MCPConnectionInfo;
        enabled: boolean;
    }[];
}

type MCPConnectionInfo =
    | MCPWebSocketConnection
    | MCPHttpConnection
    | MCPCustomConnection;

type MCPWebSocketConnection = {
    url: string;
    headers?: Record<string, string>;
};

/// I would consider removing streams depending upon how difficult they are to implement, for now aassume no streaming and awaiting the entire resposne
type MCPHttpConnection = {
    url: string;
    streaming?: boolean;
    headers?: Record<string, string>;
    protocol?: "http" | "sse" | "streamable_http";
};

type MCPCustomConnection = {
    [key: string]: any;           // your own schema
};
