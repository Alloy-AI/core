import { type Address, type Hex } from 'viem';
import { privateKeyToAccount, mnemonicToAccount, type HDAccount, type PrivateKeyAccount } from 'viem/accounts';

// Import session context (will be created)
let getSessionContext: ((sessionId: string) => any) | null = null;
let getCurrentSessionId: (() => string | undefined) | null = null;

// Set the session context getter (to avoid circular dependency)
export function setSessionContextGetter(getter: (sessionId: string) => any) {
    getSessionContext = getter;
}

// Set the current session ID getter
export function setCurrentSessionIdGetter(getter: () => string | undefined) {
    getCurrentSessionId = getter;
}

/**
 * Get the configured account from environment (private key or mnemonic)
 * This is the fallback method when no session context is available
 *
 * Configuration options:
 * - EVM_PRIVATE_KEY: Hex private key (with or without 0x prefix)
 * - EVM_MNEMONIC: BIP-39 mnemonic phrase (12 or 24 words)
 * - EVM_ACCOUNT_INDEX: Optional account index for HD wallet derivation (default: 0)
 */
export const getConfiguredAccount = (): HDAccount | PrivateKeyAccount => {
    const privateKey = process.env.EVM_PRIVATE_KEY;
    const mnemonic = process.env.EVM_MNEMONIC;
    const accountIndexStr = process.env.EVM_ACCOUNT_INDEX || '0';
    const accountIndex = parseInt(accountIndexStr, 10);

    // Validate account index
    if (isNaN(accountIndex) || accountIndex < 0 || !Number.isInteger(accountIndex)) {
        throw new Error(
            `Invalid EVM_ACCOUNT_INDEX: "${accountIndexStr}". Must be a non-negative integer.`
        );
    }

    if (privateKey) {
        // Use private key if provided
        const key = (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as Hex;
        return privateKeyToAccount(key);
    } else if (mnemonic) {
        // Use mnemonic if provided
        return mnemonicToAccount(mnemonic, { accountIndex });
    } else {
        throw new Error(
            "Neither EVM_PRIVATE_KEY nor EVM_MNEMONIC environment variable is set, " +
            "and no session private key is available. " +
            "Either configure environment variables or provide a private key in the Bearer token when connecting.\n" +
            "- EVM_PRIVATE_KEY: Your private key in hex format\n" +
            "- EVM_MNEMONIC: Your 12 or 24 word mnemonic phrase\n" +
            "- EVM_ACCOUNT_INDEX: (Optional) Account index for HD wallet (default: 0)"
        );
    }
};

/**
 * Helper to get the configured private key (for services that need it)
 * Supports both session-based private keys and environment-based configuration
 *
 * @param sessionId Optional session ID to get the private key from session context
 * For HDAccount (from mnemonic): extracts private key from HD key
 * For PrivateKeyAccount: returns the original private key
 */
export const getConfiguredPrivateKey = (sessionId?: string): Hex => {
    // Determine which session ID to use
    const effectiveSessionId = sessionId || (getCurrentSessionId ? getCurrentSessionId() : undefined);

    // Try to get private key from session context first
    if (effectiveSessionId && getSessionContext) {
        try {
            const context = getSessionContext(effectiveSessionId);
            if (context && context.hasPrivateKey()) {
                return context.getPrivateKey();
            }
        } catch (error) {
            // Fall through to environment-based configuration
        }
    }

    // Fall back to environment-based configuration
    const account = getConfiguredAccount();

    // Check if this is an HDAccount (has getHdKey method)
    if ('getHdKey' in account && typeof account.getHdKey === 'function') {
        const hdKey = account.getHdKey();
        if (!hdKey.privateKey) {
            throw new Error("Unable to derive private key from HD account - no private key in HD key");
        }
        // Convert Uint8Array to hex string
        const privateKeyHex = Buffer.from(hdKey.privateKey).toString('hex');
        return `0x${privateKeyHex}` as Hex;
    }

    // For PrivateKeyAccount, re-read from environment since we created from it
    if ('source' in account && account.source === 'privateKey') {
        const privateKey = process.env.EVM_PRIVATE_KEY;
        if (privateKey) {
            return (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as Hex;
        }
    }

    throw new Error("Unable to extract private key from account");
};

/**
 * Helper to get wallet address
 * @param sessionId Optional session ID to get the address from session-based private key
 */
export const getWalletAddressFromKey = (sessionId?: string): Address => {
    // Determine which session ID to use
    const effectiveSessionId = sessionId || (getCurrentSessionId ? getCurrentSessionId() : undefined);

    // Try to get from session context first
    if (effectiveSessionId && getSessionContext) {
        try {
            const context = getSessionContext(effectiveSessionId);
            if (context && context.hasPrivateKey()) {
                const privateKey = context.getPrivateKey();
                const account = privateKeyToAccount(privateKey);
                return account.address;
            }
        } catch (error) {
            // Fall through to environment-based configuration
        }
    }

    // Fall back to environment-based configuration
    const account = getConfiguredAccount();
    return account.address;
};

/**
 * Helper to get configured wallet object
 * @param sessionId Optional session ID to get the wallet from session-based private key
 */
export const getConfiguredWallet = (sessionId?: string): { address: Address } => {
    return { address: getWalletAddressFromKey(sessionId) };
};
