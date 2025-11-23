import NameStone from "@namestone/namestone-sdk";
import { env } from "../env";
import type { Agent } from "./Agent";
import { privateKeyToAddress } from "viem/accounts";

const ns = new NameStone(env.NAMESTONE_API_KEY);

export async function updateAgentEnsStatus(agent: Agent, status: string) {
  const ensName = agent.agentDescriptor.ens.split(".")[0];

  await ns.setName({
    domain: env.ENS_DOMAIN,
    name: ensName,
    address: privateKeyToAddress(agent.privateKey),
    text_records: {
      avatar: agent.agentDescriptor.imageUrl,
      description: agent.agentDescriptor.description ?? "",
      website: "alloy.ai",
      location: "World Alloy",
      status,
    },
  });
}
