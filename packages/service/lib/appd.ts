import { existsSync } from 'node:fs';
import {
    RoflClient,
    KeyKind,
    ROFL_SOCKET_PATH
} from '@oasisprotocol/rofl-client';

const client = new RoflClient();

async function getAppId(): Promise<string> {
    return client.getAppId();
}

async function getEvmSecretKey(keyId: string): Promise<string> {
    if (existsSync(ROFL_SOCKET_PATH)) {
        const hex = await client.generateKey(keyId, KeyKind.SECP256K1);
        return hex.startsWith('0x') ? hex : `0x${hex}`;
    }

    // const allow = process.env.ALLOW_LOCAL_DEV === 'true';
    // const pk = process.env.LOCAL_DEV_SK;
    // if (allow && pk && /^0x[0-9a-fA-F]{64}$/.test(pk)) return pk;
    throw new Error(
        'rofl-appd socket not found'
    );
}

export const appd = {
    getAppId,
    getEvmSecretKey,
}
