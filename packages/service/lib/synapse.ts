import { RPC_URLS, Synapse } from "@filoz/synapse-sdk";
import { eq } from "drizzle-orm";
import type { Address } from "viem";
import env from "../../env";
import db from "../db";
import { tryCatch } from "../utils/tryCatch";

// because filbeam links are very useful
const WITH_CDN = true;

export async function getOrCreateUserDataset(walletAddress: Address) {
  const synapse = await Synapse.create({
    privateKey: env.EVM_PRIVATE_KEY_SYNAPSE,
    rpcURL: RPC_URLS.calibration.websocket,
    withCDN: WITH_CDN,
  });

  const [existing] = await db
    .select()
    .from(db.schema.usersDatasets)
    .where(eq(db.schema.usersDatasets.walletAddress, walletAddress));

  if (existing) {
    const ctx = await tryCatch(
      synapse.storage.createContext({
        dataSetId: existing.dataSetId,
        providerAddress: existing.providerAddress,
        metadata: { filosign_user: walletAddress },
      }),
    );

    if (ctx.error) {
      throw new Error(
        "Fail to create synapse context for existing user dataset",
        ctx.error,
      );
    }

    return ctx.data;
  }

  const ctx = await tryCatch(
    synapse.storage.createContext({
      metadata: { filosign_user: walletAddress },
    }),
  );

  if (ctx.error) {
    throw new Error("Fail to create synapse context for new user dataset");
  }

  if (ctx.data.dataSetId !== undefined) {
    await db.insert(db.schema.usersDatasets).values({
      walletAddress,
      dataSetId: ctx.data.dataSetId,
      providerAddress: ctx.data.provider.serviceProvider,
    });
  }

  return ctx.data;
}
