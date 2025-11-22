import { appd } from "./appd";

function concat(...parts: Uint8Array[]) {
    const len = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(len);
    let off = 0;
    for (const p of parts) {
        out.set(p, off);
        off += p.length;
    }
    return out;
}

async function hkdfSha512(
    ikm: ArrayBuffer,
    info: ArrayBuffer | undefined,
    lengthBytes: number,
) {
    const salt = new Uint8Array(64);
    const key = await crypto.subtle.importKey(
        "raw",
        ikm,
        { name: "HKDF" },
        false,
        ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
        { name: "HKDF", hash: "SHA-512", salt, info: info ?? new Uint8Array(0) },
        key,
        lengthBytes * 8,
    );
    return new Uint8Array(bits);
}

export async function deriveAesGcmKey(secret: ArrayBuffer, info?: string) {
    const raw = await hkdfSha512(
        secret,
        info ? new TextEncoder().encode(info).buffer : undefined,
        32,
    );
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
    ]);
}

export async function encryptSelf(args: {
    message: string;
}) {
    const { message } = args;

    const key = await appd.getEncryptionKey();
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const messageBytes = new TextEncoder().encode(message);
    const ct = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        messageBytes,
    );
    const encrypted = concat(iv, new Uint8Array(ct));
    return btoa(String.fromCharCode(...encrypted));
}

export async function decryptSelf(args: {
    ciphertext: string;
}) {
    const { ciphertext } = args;

    const ctArr = new Uint8Array(
        atob(ciphertext)
            .split("")
            .map((c) => c.charCodeAt(0))
    );
    if (ctArr.length < 12) throw new Error("ciphertext too short");
    const iv = ctArr.slice(0, 12);
    const ct = ctArr.slice(12);
    const key = await appd.getEncryptionKey();
    const pt = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        ct,
    );
    return new TextDecoder().decode(pt);
}
