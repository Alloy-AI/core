import { Hono } from "hono";
import { privateKeyToAddress } from "viem/accounts";
import z from "zod";
import { appd } from "../lib/appd";
import { identityRegistry } from "../lib/erc80004.defs";
import { getEvmClient, isSupportedChain } from "../lib/evm";
import { jsonParse, jsonStringify } from "../lib/json";
import { generateProfileImage } from "../lib/nanobanana";
import { calculatePieceCid } from "../lib/piece";
import { respond } from "../lib/Router";
import { getOrCreateDataset, serverAddressSynapse } from "../lib/synapse";
import { tryCatch } from "../lib/tryCatch";
import { authenticated } from "../middleware/auth";
import type { AgentDescriptor, EIP155Address } from "../types/agent";
import { Agent } from "../lib/Agent";
import db from "../db/client";
import schema from "../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/", authenticated, async (c) => {
  const agents = await db.select().from(schema.agents);
  return respond.ok(c, { agents }, "Agents retrieved successfully", 200);
});

app.post("/message", async (ctx) => {
  const body = await ctx.req.json();
  const parsedBody = z
    .object({
      message: z.string().min(1),
      agentId: z.string().min(1),
    })
    .safeParse(body);

  if (!parsedBody.success) {
    return ctx.json(
      { error: `Invalid request body ${parsedBody.error.message}` },
      { status: 400 },
    );
  }

  const { message, agentId } = parsedBody.data;

  const agent = await Agent.fromId({ id: Number(agentId) });

  const response = await agent.generateResponse({ message });

  return respond.ok(ctx, { response }, "Respsne generated sucesffulyy", 200);
});

app.post("/", authenticated, async (c) => {
  const body = await tryCatch(c.req.json());
  if (body.error) {
    return respond.err(c, `Invalid JSON body ${body.error}`, 400);
  }
  const agentSeed = Bun.randomUUIDv7();
  const bodyParsed = z
    .object({
      name: z.string().min(3).max(100),
      description: z.string().min(10).max(500),
      model: z.string().min(3).max(100),
      baseSystemPrompt: z.string().min(10).max(1000),
      chains: z.array(z.number()),
    })
    .safeParse(body.data);

  if (!bodyParsed.success) {
    return respond.err(
      c,
      `Invalid request body ${bodyParsed.error.message}`,
      400,
    );
  }

  const opts = bodyParsed.data;

  const url = new URL(c.req.url);

  const imageBytesResult = await tryCatch(
    generateProfileImage({ name: opts.name, description: opts.description }),
  );
  if (imageBytesResult.error) {
    return respond.err(
      c,
      `Failed to generate profile image: ${imageBytesResult.error}`,
      500,
    );
  }
  const imageBytes = imageBytesResult.data;

  const dsResult = await tryCatch(getOrCreateDataset());
  if (dsResult.error) {
    return respond.err(
      c,
      `Failed to get or create dataset: ${dsResult.error}`,
      500,
    );
  }
  const ds = dsResult.data;

  const imagePieceCid = calculatePieceCid(imageBytes);
  const filecoinUrl = `https://${serverAddressSynapse}.calibration.filbeam.io/${imagePieceCid}`;

  ds.upload(imageBytes);

  const agentPvtKeyResult = await tryCatch(appd.getEvmSecretKey(agentSeed));
  if (agentPvtKeyResult.error) {
    return respond.err(
      c,
      `Failed to get agent private key: ${agentPvtKeyResult.error}`,
      500,
    );
  }
  const agentPvtKey = agentPvtKeyResult.data;
  const agentAddress = privateKeyToAddress(agentPvtKey);

  const addresses: {
    name: "agentWallet" | "operatorWallet";
    endpoint: EIP155Address;
  }[] = [];
  for (const chainId of opts.chains) {
    if (!isSupportedChain(chainId)) continue;

    addresses.push({
      name: "agentWallet",
      endpoint: `eip155:${chainId}:${agentAddress}`,
    });
    addresses.push({
      name: "operatorWallet",
      endpoint: `eip155:${chainId}:${c.get("userWallet")}`,
    });
  }
  const endpoints: AgentDescriptor["registration"]["endpoints"] = [
    {
      name: "A2A",
      endpoint: `${url.protocol}//${url.host}/agents/${agentAddress}/.well-known/agent-card.json`,
    },
    ...addresses,
  ];

  const registrationEndpoint = `${url.protocol}//${url.host}/agents/${agentAddress}/registration.json`;

  const registrations: AgentDescriptor["registration"]["registrations"] = [];
  for (const chainId of opts.chains) {
    if (!isSupportedChain(chainId)) continue;

    const evmClientResult = await tryCatch(getEvmClient(chainId));
    if (evmClientResult.error) {
      return respond.err(
        c,
        `Failed to get EVM client for chain ${chainId}: ${evmClientResult.error}`,
        500,
      );
    }
    const evmClient = evmClientResult.data;

    const registryResult = await tryCatch(identityRegistry(chainId));
    if (registryResult.error) {
      return respond.err(
        c,
        `Failed to get identity registry for chain ${chainId}: ${registryResult.error}`,
        500,
      );
    }
    const registry = registryResult.data;

    const txResult = await tryCatch(
      registry.write.register([registrationEndpoint]),
    );
    if (txResult.error) {
      return respond.err(
        c,
        `Failed to register for chain ${chainId}: ${txResult.error}`,
        500,
      );
    }
    const tx = txResult.data;

    const receiptResult = await tryCatch(
      evmClient.waitForTransactionReceipt({ hash: tx }),
    );
    if (receiptResult.error) {
      return respond.err(
        c,
        `Failed to wait for transaction receipt for chain ${chainId}: ${receiptResult.error}`,
        500,
      );
    }
    const receipt = receiptResult.data;

    const logsResult = await tryCatch(
      evmClient.getContractEvents({
        address: registry.address,
        abi: registry.abi,
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
        eventName: "Registered",
      }),
    );
    if (logsResult.error) {
      return respond.err(
        c,
        `Failed to get contract events for chain ${chainId}: ${logsResult.error}`,
        500,
      );
    }
    const logs = logsResult.data;

    logs.forEach(async (log) => {
      if (log.args.agentId) {
        registry.write.safeTransferFrom([
          evmClient.account.address,
          c.get("userWallet"),
          log.args.agentId,
        ]);

        registrations.push({
          agentId: Number(log.args.agentId),
          agentRegistry: `eip155:${chainId}:${registry.address}`,
        });
      }
    });
  }
  const registration: AgentDescriptor["registration"] = {
    name: opts.name,
    description: opts.description,
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    image: filecoinUrl,
    endpoints,
    registrations,
    supportedTrust: ["reputation", "crypto-economic", "tee-attestation"],
  };
  const registrationBytes = new TextEncoder().encode(
    jsonStringify(registration),
  );
  const registrationPieceCid = calculatePieceCid(registrationBytes);

  ds.upload(registrationBytes);

  const newAgent = await tryCatch(
    db
      .insert(schema.agents)
      .values({
        name: opts.name,
        keySeed: agentSeed,
        address: agentAddress,
        description: opts.description,
        model: opts.model,
        baseSystemPrompt: opts.baseSystemPrompt,
        registrationPieceCid: registrationPieceCid.toString(),
        knowledgeBases: [],
        tools: [],
      })
      .returning({ agentId: schema.agents.id }),
  );

  if (newAgent.error) {
    return respond.err(
      c,
      `Failed to create agent in db ${newAgent.error.message}`,
      500,
    );
  }

  return respond.ok(
    c,
    { agentId: newAgent.data[0] },
    "Agent created successfully",
    201,
  );
});

//@jriyyya

app.get("/:id", authenticated, async (c) => {
  const id = c.req.param("id");
  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.id, Number(id)));

  if (!agent) {
    return respond.err(c, "Agent not found", 404);
  }

  return respond.ok(c, { agent }, "Agent details retrieved successfully", 200);
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

  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.id, Number(agentId)));
  if (!agent) {
    return respond.err(c, `Agent with ID ${agentId} not found`, 404);
  }

  await db
    .update(schema.agents)
    .set({ baseSystemPrompt })
    .where(eq(schema.agents.id, Number(agentId)));

  return respond.ok(
    c,
    { agentId, baseSystemPrompt },
    "Base system prompt updated successfully",
    200,
  );
});

app.get("/:address/.well-known/agent-card.json", async (ctx) => {
  const address = ctx.req.param("address");
  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.address, address));

  if (!agent) {
    return respond.err(ctx, "Agent not found", 404);
  }

  return respond.ok(ctx, { agent }, "Agent card retrieved successfully", 200);
});

app.get("/:address/registration.json", async (ctx) => {
  const address = ctx.req.param("address");
  const [agent] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.address, address));

  if (!agent) {
    return respond.err(ctx, "Agent not found", 404);
  }

  const registrationPieceCid = agent.registrationPieceCid;
  const ds = await getOrCreateDataset();

  const registrationBytes = await ds.download(registrationPieceCid);
  const registration = jsonParse(new TextDecoder().decode(registrationBytes));

  return respond.ok(ctx, { registration }, "Registration retrieved successfully", 200);
});

export default app;
