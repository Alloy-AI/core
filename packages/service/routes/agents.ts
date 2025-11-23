import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { tryCatch } from "../lib/tryCatch";
import { AgentDescriptor, EIP155Address } from "../types/agent";
import { generateProfileImage } from "../lib/nanobanana";
import { getOrCreateDataset, serverAddressSynapse } from "../lib/synapse"; import { calculatePieceCid } from "../lib/piece";
import z from "zod";
import { getEvmClient, isSupportedChain, resolveChain } from "../lib/evm";
import { appd } from "../lib/appd";
import { privateKeyToAddress } from "viem/accounts";
import { identityRegistry } from "../lib/erc80004.defs";


const app = new Hono();

app.get("/", authenticated, async (c) => {
    const agents = await db.getAllAgents({});
    return respond.ok(c, { agents }, "Agents retrieved successfully", 200);
});

app.post("/", authenticated, async (c) => {
    const body = await tryCatch(c.req.json());
    if (body.error) {
        return respond.err(c, `Invalid JSON body ${body.error}`, 400);
    }
    const agentSeed = Bun.randomUUIDv7();
    const bodyParsed = z.object({
        name: z.string().min(3).max(100),
        description: z.string().min(10).max(500),
        model: z.string().min(3).max(100),
        baseSystemPrompt: z.string().min(10).max(1000),
        chains: z.array(z.number()),
    }).safeParse(body.data)

    if (!bodyParsed.success) {
        return respond.err(c, `Invalid request body ${bodyParsed.error.message}`, 400);
    }

    const opts = bodyParsed.data;

    const url = new URL(c.req.url);

    const imageBytes = await generateProfileImage({ name: opts.name, description: opts.description });
    const ds = await getOrCreateDataset()
    const imagePieceCid = calculatePieceCid(imageBytes);
    const filecoinUrl = `https://${serverAddressSynapse}.calibration.filbeam.io/${imagePieceCid}`;
    ds.upload(imageBytes)

    const agentPvtKey = await appd.getEvmSecretKey(agentSeed)
    const agentAddress = privateKeyToAddress(agentPvtKey)

    const addresses: { name: "agentWallet" | "operatorWallet", endpoint: EIP155Address }[] = []
    for (const chainId of opts.chains) {
        if (!isSupportedChain(chainId)) continue;

        addresses.push({
            name: "agentWallet",
            endpoint: `eip155:${chainId}:${agentAddress}`
        });
        addresses.push({
            name: "operatorWallet",
            endpoint: `eip155:${chainId}:${c.get("userWallet")}`
        });
    }
    const endpoints: AgentDescriptor["registration"]["endpoints"] = [
        {
            name: "A2A",
            endpoint: `${url.protocol}//${url.host}/agents/${agentAddress}/.well-known/agent-card.json`
        },
        ...addresses
    ];

    const registrationEndpoint = `${url.protocol}//${url.host}/agents/${agentAddress}/registration.json`;

    const registrations: AgentDescriptor["registration"]["registrations"] = [];
    for (const chainId of opts.chains) {
        if (!isSupportedChain(chainId)) continue;
        const evmClient = await getEvmClient(chainId);
        const registry = await identityRegistry(chainId);
        const tx = await registry.write.register([registrationEndpoint])
        const receipt = await evmClient.waitForTransactionReceipt({ hash: tx });
        const logs = await evmClient.getContractEvents({
            address: registry.address,
            abi: registry.abi,
            fromBlock: receipt.blockNumber,
            toBlock: receipt.blockNumber,
            eventName: "Registered"
        })
        logs.forEach(log => {
            if (log.args.agentId) {
                registrations.push({
                    agentId: Number(log.args.agentId),
                    agentRegistry: `eip155:${chainId}:${registry.address}`,
                })
            }
        })
    }
    const registration: AgentDescriptor["registration"] = {
        name: opts.name,
        description: opts.description,
        type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
        image: filecoinUrl,
        endpoints,
        registrations,
        supportedTrust: [
            "reputation",
            "crypto-economic",
            "tee-attestation"
        ]
    };
    const registrationBytes = new TextEncoder().encode(JSON.stringify(registration));
    const registrationPieceCid = calculatePieceCid(registrationBytes);
    ds.upload(registrationBytes);

    const agentId = await tryCatch(db.createAgent({
        agentData: {
            name: opts.name,
            keySeed: agentSeed,
            description: opts.description,
            model: opts.model,
            baseSystemPrompt: opts.baseSystemPrompt,
            registrationPieceCid: registrationPieceCid.toString(),
            knowledgeBases: [],
            tools: [],
            mcpServers: [],
        }
    }));

    if (agentId.error) {
        return respond.err(c, `Failed to create agent in db ${agentId.error.message}`, 500);
    }

    return respond.ok(c, { agentId: agentId.data }, "Agent created successfully", 201);
});

app.get("/:address/.well-known/agent-card.json", async (ctx) => {
    const address = ctx.req.param("address");
    const agent = await db.getAgent({ id: address });

    if (!agent) {
        return ctx.json({ error: "Agent not found" }, { status: 404 });
    }
})

app.get("/:address/registration.json", async (ctx) => {
    const address = ctx.req.param("address");
    const agent = await db.getAgent({ id: address });

    if (!agent) {
        return ctx.json({ error: "Agent not found" }, { status: 404 });
    }
})

app.get("/:id", authenticated, async (c) => {
    const id = c.req.param("id");
    const agent = await db.getAgent({ id });

    if (!agent) {
        return respond.err(c, "Agent not found", 404);
    }

    return respond.ok(c, { agent }, "Agent details retrieved successfully", 200);
});


app.patch("/:id", authenticated, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();


    const updatePayload = {
        id,
        updates: body,
    };

    const agent = await db.getAgent({ id });
    if (!agent) {
        return respond.err(c, "Agent not found", 404);
    }

    await db.updateAgent(updatePayload);
    return respond.ok(c, { id }, "Agent updated successfully", 200);
});


app.delete("/:id", authenticated, async (c) => {
    const id = c.req.param("id");
    const agent = await db.getAgent({ id });

    if (!agent) {
        return respond.err(c, "Agent not found", 404);
    }

    await db.deleteAgent({ id });
    return respond.ok(c, { id }, "Agent deleted successfully", 200);
});


app.get("/:id/pk", (c) => {
    return respond.ok(c, { status: "ok" }, "", 200);
});

app.put("/:id/base-system-prompt", authenticated, async (c) => {
    const agentId = c.req.param("id");

    if (!agentId) {
        return respond.err(c, "Agent ID is required", 400);
    }

    const body = (await c.req.json()) as { baseSystemPrompt?: string };
    const { baseSystemPrompt } = body;

    if (!baseSystemPrompt || typeof baseSystemPrompt !== "string") {
        return respond.err(
            c,
            "baseSystemPrompt is required and must be a string",
            400,
        );
    }

    const agent = await db.getAgent({ id: agentId });
    if (!agent) {
        return respond.err(c, `Agent with ID ${agentId} not found`, 404);
    }

    await db.updateAgent({ id: agentId, updates: { baseSystemPrompt } });

    return respond.ok(
        c,
        { agentId, baseSystemPrompt },
        "Base system prompt updated successfully",
        200,
    );
});

export default app;
