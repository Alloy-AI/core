import { Hono } from "hono";
import { db } from "../db/client";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import { tryCatch } from "../lib/tryCatch";
import { AgentDescriptor } from "../types/agent";
import { generateProfileImage } from "../lib/nanobanana";
import { getOrCreateDataset, serverAddressSynapse } from "../lib/synapse"; import { calculatePieceCid } from "../lib/piece";
import z from "zod";
import { resolveChain } from "../lib/evm";


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
    const bodyParsed = z.object({
        name: z.string().min(3).max(100),
        description: z.string().min(10).max(500),
        model: z.string().min(3).max(100),
        baseSystemPrompt: z.string().min(10).max(1000),
        chains: z.array(z.number()),
    }).safeParse( body.data)

    if (!bodyParsed.success) {
        return respond.err(c, `Invalid request body ${bodyParsed.error.message}`, 400);
    }

    const opts = bodyParsed.data;

    const imageBytes = await generateProfileImage({ name: opts.name, description: opts.description });
    const ds = await getOrCreateDataset()
    const imagePieceCid = calculatePieceCid(imageBytes);
    const filecoinUrl = `https://${serverAddressSynapse}.calibration.filbeam.io/${imagePieceCid}`;

    ds.upload(imageBytes)

    const addresses = []
    for (const chainId of opts.chains) {
        const chain = resolveChain(chainId);
    }
    const endpoints: AgentDescriptor["registration"]["endpoints"] = [
        {
            name: "A2A",
            endpoint: ""
        },
    ]

    const registrations : AgentDescriptor["registration"]["registrations"] = [
        {}
    ];
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
    }

    const agentId = await tryCatch(db.createAgent({
        agentData: {
            name: opts.name,
            description: opts.description,
            model: opts.model,
            baseSystemPrompt: opts.baseSystemPrompt,
            registrationPieceCid: "",
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

app.get("/:id/.well-known/agent-card.json", async (ctx) => {
    const id = ctx.req.param("id");
    const agent = await db.getAgent({ id });

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
