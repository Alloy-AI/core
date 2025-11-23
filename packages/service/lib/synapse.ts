import { RPC_URLS, Synapse } from "@filoz/synapse-sdk";
import type { Address } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import { env } from "../env";
import { tryCatch } from "./tryCatch";

// because filbeam links are very useful
const WITH_CDN = true;

export const serverAddressSynapse = privateKeyToAddress(
  env.EVM_PRIVATE_KEY_SYNAPSE,
);

export async function getOrCreateDataset() {
  const synapse = await Synapse.create({
    privateKey: env.EVM_PRIVATE_KEY_SYNAPSE,
    rpcURL: RPC_URLS.calibration.websocket,
    withCDN: WITH_CDN,
  });

  const ctx = await tryCatch(
    synapse.storage.createContext({
      metadata: {},
    }),
  );

  if (ctx.error) {
    throw new Error("Fail to create synapse context for new user dataset");
  }

  return ctx.data;
}
