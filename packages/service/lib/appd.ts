import { existsSync } from "node:fs";
import {
    KeyKind,
    ROFL_SOCKET_PATH,
    RoflClient,
} from "@oasisprotocol/rofl-client";
import { Hex, hexToBytes, isHex } from "viem";
import { deriveAesGcmKey } from "./crypto";
import { isProd } from "../env";

const client = new RoflClient();

async function getAppId(): Promise<string> {
    return client.getAppId();
}

async function getEvmSecretKey(keyId: string): Promise<Hex> {

    if(!isProd){
        return "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;
    }

    if (existsSync(ROFL_SOCKET_PATH)) {
        const hex = await client.generateKey(keyId, KeyKind.SECP256K1);
        const key =  hex.startsWith("0x") ? hex : `0x${hex}`;
        if (!isHex(key)) {
            throw new Error("Generated key is not a valid hex string");
        }
        return key;
    }

    // const allow = process.env.ALLOW_LOCAL_DEV === 'true';
    // const pk = process.env.LOCAL_DEV_SK;
    // if (allow && pk && /^0x[0-9a-fA-F]{64}$/.test(pk)) return pk;
    throw new Error("rofl-appd socket not found");
}

async function getEncryptionKey() {
    const devKeyHex =
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    let pvtKeyBytes = hexToBytes(devKeyHex);

    if (!isProd) {
        return deriveAesGcmKey(
            new Uint8Array(pvtKeyBytes).buffer,
            "local",
        );
    }

    const pvtKeyHex = await client.generateKey("encryption", KeyKind.ED25519);
    const viemPvtKeyHex = isHex(pvtKeyHex)
        ? pvtKeyHex
        : (`0x${pvtKeyHex}` as const);

    pvtKeyBytes = hexToBytes(viemPvtKeyHex);

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
