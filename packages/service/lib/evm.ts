import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { appd } from "./appd";
import { env } from "../env";

export type ChainId = 11155111;

export function isSupportedChain(chainId: number): chainId is ChainId {
  return chainId === 11155111;
}

export function resolveChain(chainId: ChainId) {
  switch (chainId) {
    case 11155111:
      return sepolia;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export function getRpc(chainId: ChainId) {
  switch (chainId) {
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
    default:
      return undefined;
  }
}

export async function getEvmClient(chainId: ChainId) {
  return createWalletClient({
    account: privateKeyToAccount(await appd.getEvmSecretKey("global")),
    transport: http(
      getRpc(chainId) ?? resolveChain(chainId).rpcUrls.default.http[0],
    ),
    chain: resolveChain(chainId),
  }).extend(publicActions);
}
