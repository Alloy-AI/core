import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Async context for tracking the current session ID
 * This allows us to access the session ID from anywhere in the call stack
 */
interface RequestContext {
  sessionId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current session ID from async context
 */
export function getCurrentSessionId(): string | undefined {
  const context = requestContext.getStore();
  return context?.sessionId;
}

/**
 * Run code with a specific session context
 */
export function runWithSessionContext<T>(sessionId: string, fn: () => T): T {
  return requestContext.run({ sessionId }, fn);
}
