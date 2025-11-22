# Agent2Agent (A2A) Protocol Integration Guide

This guide outlines the steps to integrate Google's Agent2Agent (A2A) Protocol into the Alloy on-chain AI agent orchestration platform.

## Overview

The integration involves three main components:
1.  **Agent Card (Identity):** Standardized capability advertisement.
2.  **On-Chain Registry (Discovery):** Smart contract for agent discovery.
3.  **Service Layer (Communication):** HTTP endpoints for A2A interaction.

## 1. Agent Card Definition

Agents must serve a standardized JSON "card" that describes their capabilities.

**Location:** `packages/service/lib/a2a.ts`

```typescript
export interface AgentCard {
  id: string;
  name: string;
  description: string;
  capabilities: string[]; // e.g., ["search", "generate-image", "on-chain-tx"]
  version: "1.0.0";
  endpoints: {
    rpc: string; // URL for JSON-RPC task requests
    doc?: string; // Optional URL for human-readable documentation
  };
}
```

## 2. On-Chain Discovery Layer

A smart contract is required to allow agents to register their service URLs and be discovered by others.

**Contract:** `packages/contracts/contracts/AgentRegistry.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgentRegistry {
    struct AgentService {
        string id;
        string url;         // Base URL (e.g., https://agent.api.com)
        string metadataURI; // Link to Agent Card/Metadata
        address owner;
    }

    mapping(string => AgentService) public agents;

    event AgentRegistered(string indexed id, string url, address owner);

    function registerAgent(string memory _id, string memory _url, string memory _metadataURI) public {
        agents[_id] = AgentService(_id, _url, _metadataURI, msg.sender);
        emit AgentRegistered(_id, _url, msg.sender);
    }

    function getAgentUrl(string memory _id) public view returns (string memory) {
        return agents[_id].url;
    }
}
```

## 3. Service Layer Implementation

The service (`packages/service`) needs to expose endpoints to serve the Agent Card and handle incoming tasks via JSON-RPC.

### A. Serve Agent Card
**Endpoint:** `GET /.well-known/a2a.json`

Response:
```json
{
  "id": "agent-123",
  "name": "Alloy Orchestrator",
  "description": "On-chain orchestration agent",
  "version": "1.0.0",
  "endpoints": {
    "rpc": "https://my-service.com/a2a/rpc"
  }
}
```

### B. Handle RPC Tasks
**Endpoint:** `POST /a2a/rpc`

Request (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "method": "execute_task",
  "params": {
    "task": "analyze_token",
    "inputs": { "symbol": "ETH" }
  },
  "id": 1
}
```

Implementation in `packages/service/index.ts`:
```typescript
router.post('/a2a/rpc', async (ctx) => {
    const body = await ctx.req.json();
    
    if (body.method === 'handshake') {
        // Validate identity and capabilities
        return ctx.ok({ jsonrpc: "2.0", result: { status: "accepted" }, id: body.id });
    }

    if (body.method === 'execute_task') {
        // Execute internal agent logic
        return ctx.ok({ jsonrpc: "2.0", result: { output: "result_data" }, id: body.id });
    }

    return ctx.err("Method not found", 404);
});
```

## 4. Client Implementation (Orchestrator)

To allow your agents to call others, implement a client utility.

**Location:** `packages/service/lib/a2a-client.ts`

```typescript
export async function callOtherAgent(agentUrl: string, method: string, params: any) {
    // 1. (Optional) Fetch agent card for validation
    // 2. Send RPC request
    const response = await fetch(`${agentUrl}/a2a/rpc`, {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: Date.now()
        })
    });
    return response.json();
}
```

