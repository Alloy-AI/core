import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, baseSepolia, polygonAmoy } from "viem/chains";
import { appd } from "./appd";
import { env } from "../env";

export type ChainId = 11155111 | 84532 | 80002;

export function isSupportedChain(chainId: number): chainId is ChainId {
  return chainId === 11155111 || chainId === 84532 || chainId === 80002;
}

export function resolveChain(chainId: ChainId) {
  switch (chainId) {
    case 11155111:
      return sepolia;
    case 84532:
      return baseSepolia;
    case 80002:
      return polygonAmoy;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export function getRpc(chainId: ChainId) {
  switch (chainId) {
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
    case 84532:
      return `https://base-sepolia.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
    case 80002:
      return `https://polygon-amoy.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
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
