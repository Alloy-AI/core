import { randomUUID } from "node:crypto";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import type { Hex } from "viem";
import { runWithSessionContext } from "./async-context.js";
import startServer from "./server.js";
import { deleteSessionContext, getSessionContext } from "./session-context.js";

// Environment variables
const PORT = parseInt(process.env.MCP_PORT || "3001", 10);
const HOST = process.env.MCP_HOST || "0.0.0.0";

console.error(`Configured to listen on ${HOST}:${PORT}`);

// Setup Express
const app = express();
app.use(express.json({ limit: "10mb" })); // Prevent DoS attacks with huge payloads

/**
 * Extract and validate private key from Bearer token
 * Expected format: Authorization: Bearer <hex_private_key>
 */
function extractPrivateKeyFromBearer(req: Request): Hex | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Validate it's a valid hex private key (with or without 0x prefix)
  const privateKey = token.startsWith("0x") ? token : `0x${token}`;

  // Basic validation: should be 66 characters (0x + 64 hex chars)
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error(
      "Invalid private key format in Bearer token. Expected 64 hex characters.",
    );
  }

  return privateKey as Hex;
}

// Track active transports by session ID with cleanup
const transports = new Map<string, StreamableHTTPServerTransport>();
const sessionTimestamps = new Map<string, number>();
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Cleanup stale sessions periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [sessionId, timestamp] of sessionTimestamps.entries()) {
      if (now - timestamp > SESSION_TIMEOUT_MS) {
        console.error(`Cleaning up stale session: ${sessionId}`);
        const transport = transports.get(sessionId);
        if (transport) {
          transport
            .close()
            .catch((err) =>
              console.error(`Error closing stale session ${sessionId}:`, err),
            );
        }
        transports.delete(sessionId);
        sessionTimestamps.delete(sessionId);
        deleteSessionContext(sessionId); // Clean up session context
      }
    }
  },
  5 * 60 * 1000,
); // Check every 5 minutes

// Initialize the MCP server
let server: McpServer | null = null;
startServer()
  .then((s) => {
    server = s;
    console.error("MCP Server initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  });

// Handle all MCP requests through POST /mcp
app.post("/mcp", async (req: Request, res: Response) => {
  console.error(`Received POST /mcp request from ${req.ip}`);

  if (!server) {
    console.error("Server not initialized yet");
    res.status(503).json({ error: "Server not initialized" });
    return;
  }

  // Extract private key from Bearer token
  let privateKey: Hex | null = null;
  try {
    privateKey = extractPrivateKeyFromBearer(req);
  } catch (error) {
    console.error(`Invalid Bearer token: ${error}`);
    res.status(401).json({
      error: "Invalid private key in Bearer token",
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  // Check for existing session
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    // Reuse existing transport for this session
    transport = transports.get(sessionId)!;
    sessionTimestamps.set(sessionId, Date.now()); // Update last activity
    console.error(`Reusing transport for session: ${sessionId}`);

    // Update private key in session context if provided
    if (privateKey) {
      const context = getSessionContext(sessionId);
      context.setPrivateKey(privateKey);
      console.error(`Updated private key for session: ${sessionId}`);
    }
  } else if (!sessionId) {
    // New session - require private key
    if (!privateKey) {
      console.error("No private key provided for new session");
      res.status(401).json({
        error: "Private key required",
        message:
          "Please provide your Ethereum private key in the Authorization header as 'Bearer <private_key>'",
      });
      return;
    }

    // New session - create transport with session ID generator
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        console.error(`Session initialized: ${newSessionId}`);
        transports.set(newSessionId, transport);
        sessionTimestamps.set(newSessionId, Date.now());

        // Set private key in session context
        const context = getSessionContext(newSessionId);
        context.setPrivateKey(privateKey!);
        console.error(`Private key configured for session: ${newSessionId}`);
      },
      onsessionclosed: (closedSessionId) => {
        console.error(`Session closed: ${closedSessionId}`);
        transports.delete(closedSessionId);
        sessionTimestamps.delete(closedSessionId);
        deleteSessionContext(closedSessionId); // Clean up session context
      },
    });

    // Connect the transport to the server
    await server.connect(transport);
    console.error("New transport connected to server");
  } else {
    // Invalid session ID provided
    console.error(`Invalid session ID: ${sessionId}`);
    res.status(404).json({ error: "Session not found" });
    return;
  }

  // Handle the request within session context
  try {
    // Get the session ID from transport or create a temporary one
    const currentSessionId = sessionId || "temp-session";

    // Run request handling within async context
    await runWithSessionContext(currentSessionId, async () => {
      await transport.handleRequest(req, res, req.body);
    });
  } catch (error) {
    console.error(`Error handling request: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
});

// Handle GET requests for SSE streams (server-to-client notifications)
app.get("/mcp", async (req: Request, res: Response) => {
  console.error(`Received GET /mcp request from ${req.ip}`);

  if (!server) {
    res.status(503).json({ error: "Server not initialized" });
    return;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({ error: "Invalid or missing session ID" });
    return;
  }

  const transport = transports.get(sessionId)!;

  try {
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error(`Error handling SSE request: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
});

// Handle DELETE requests to close sessions
app.delete("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const transport = transports.get(sessionId)!;

  try {
    await transport.handleRequest(req, res);
    // Clean up session context
    deleteSessionContext(sessionId);
  } catch (error) {
    console.error(`Error closing session: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    server: server ? "initialized" : "initializing",
    activeSessions: transports.size,
    sessionIds: Array.from(transports.keys()),
  });
});

// Root endpoint for basic info
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "EVM MCP Server",
    version: "2.0.0",
    protocol: "MCP 2025-06-18",
    transport: "Streamable HTTP",
    endpoints: {
      mcp: "/mcp",
      health: "/health",
    },
    status: server ? "ready" : "initializing",
    activeSessions: transports.size,
  });
});

// Handle process termination gracefully
process.on("SIGINT", async () => {
  console.error("Shutting down server...");

  // Close all active transports
  for (const [sessionId, transport] of transports) {
    console.error(`Closing transport for session: ${sessionId}`);
    await transport.close();
    deleteSessionContext(sessionId);
  }
  transports.clear();

  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Received SIGTERM, shutting down...");

  for (const [sessionId, transport] of transports) {
    console.error(`Closing transport for session: ${sessionId}`);
    await transport.close();
    deleteSessionContext(sessionId);
  }
  transports.clear();

  process.exit(0);
});

// Start the HTTP server
const httpServer = app
  .listen(PORT, HOST, () => {
    console.error(`EVM MCP Server running at http://${HOST}:${PORT}`);
    console.error(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
    console.error(`Health check: http://${HOST}:${PORT}/health`);
    console.error(`Protocol: MCP 2025-06-18 (Streamable HTTP)`);
  })
  .on("error", (err: Error) => {
    console.error(`Server error: ${err}`);
    process.exit(1);
  });

// Set server timeout to prevent hanging connections
httpServer.timeout = 120000; // 2 minutes
httpServer.keepAliveTimeout = 65000; // 65 seconds
