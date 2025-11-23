import type { Hex } from "viem";

/**
 * Session context to store per-session private keys
 * This allows each MCP session to have its own Ethereum private key
 */
export class SessionContext {
  private privateKey: Hex | null = null;

  /**
   * Set the private key for this session
   */
  setPrivateKey(privateKey: Hex): void {
    this.privateKey = privateKey;
  }

  /**
   * Get the private key for this session
   */
  getPrivateKey(): Hex {
    if (!this.privateKey) {
      throw new Error(
        "No private key configured for this session. " +
          "Please provide a private key in the Bearer token (Authorization header) when connecting to the MCP server.",
      );
    }
    return this.privateKey;
  }

  /**
   * Check if a private key is set
   */
  hasPrivateKey(): boolean {
    return this.privateKey !== null;
  }

  /**
   * Clear the private key (for cleanup)
   */
  clear(): void {
    this.privateKey = null;
  }
}

/**
 * Global session context map
 * Maps session IDs to their respective contexts
 */
export const sessionContexts = new Map<string, SessionContext>();

/**
 * Get or create a session context
 */
export function getSessionContext(sessionId: string): SessionContext {
  if (!sessionContexts.has(sessionId)) {
    sessionContexts.set(sessionId, new SessionContext());
  }
  return sessionContexts.get(sessionId)!;
}

/**
 * Delete a session context (cleanup)
 */
export function deleteSessionContext(sessionId: string): void {
  const context = sessionContexts.get(sessionId);
  if (context) {
    context.clear();
    sessionContexts.delete(sessionId);
  }
}
