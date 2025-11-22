import { existsSync } from "node:fs";
import {
  KeyKind,
  ROFL_SOCKET_PATH,
  RoflClient,
} from "@oasisprotocol/rofl-client";
import { hexToBytes, isHex } from "viem";
import { deriveAesGcmKey } from "./crypto";

const client = new RoflClient();

async function getAppId(): Promise<string> {
  return client.getAppId();
}

async function getEvmSecretKey(keyId: string): Promise<string> {
  if (existsSync(ROFL_SOCKET_PATH)) {
    const hex = await client.generateKey(keyId, KeyKind.SECP256K1);
    return hex.startsWith("0x") ? hex : `0x${hex}`;
  }

  // const allow = process.env.ALLOW_LOCAL_DEV === 'true';
  // const pk = process.env.LOCAL_DEV_SK;
  // if (allow && pk && /^0x[0-9a-fA-F]{64}$/.test(pk)) return pk;
  throw new Error("rofl-appd socket not found");
}

async function getEncryptionKey() {
  const pvtKeyHex = await client.generateKey("encryption", KeyKind.ED25519);
  const viemPvtKeyHex = isHex(pvtKeyHex)
    ? pvtKeyHex
    : (`0x${pvtKeyHex}` as const);
  const pvtKeyBytes = hexToBytes(viemPvtKeyHex);

  const cryptoKey = deriveAesGcmKey(
    new Uint8Array(pvtKeyBytes).buffer,
    "appd-encryption-key",
  );

  return cryptoKey;
}

export const appd = {
  client,
  getEncryptionKey,
  getAppId,
  getEvmSecretKey,
};
