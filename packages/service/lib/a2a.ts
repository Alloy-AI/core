export interface AgentCard {
  id: string;
  name: string;
  description: string;
  image: string | undefined;
  version: "1.0.0";
  endpoints: {
    rpc: string; // URL for JSON-RPC task requests
    doc: string; // URL for human-readable documentation
  };
}

export function registerA2A(args: {
  name: string;
  description: string;
  image: string | undefined;
}): AgentCard {
  //TODO: register A2A and return the card

  return {
    id: "agent-123", // TODO: generate a unique id for the agent
    name: args.name,
    description: args.description,
    image: args.image,
    version: "1.0.0",
    endpoints: {
      rpc: "https://my-service.com/a2a/rpc", // TODO: generate a unique rpc endpoint for the agent
      doc: "https://my-service.com/a2a/doc", // TODO: generate a unique doc endpoint for the agent
    },
  };
}

export async function getAgent(args: { id: string }): Promise<AgentCard> {
  //TODO: get the agent from the database

  return {
    id: args.id,
    name: "Alloy Orchestrator",
    description: "On-chain orchestration agent",
    image: undefined,
    version: "1.0.0",
    endpoints: {
      rpc: "https://my-service.com/a2a/rpc",
      doc: "https://my-service.com/a2a/doc",
    },
  };
}

export async function callOtherAgent(
  agentUrl: string,
  method: string,
  params: any,
) {
  // 1. Fetch their card first if needed
  const card = await fetch(`${agentUrl}/.well-known/a2a.json`).then((r) =>
    r.json(),
  );

  // 2. Send RPC request
  const response = await fetch(`${agentUrl}/a2a/rpc`, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: Date.now(),
    }),
  });

  return response.json();
}
