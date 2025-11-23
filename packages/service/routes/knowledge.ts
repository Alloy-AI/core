import { Hono } from "hono";
import z from "zod";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import db from "../db/client";
import schema from "../db/schema";
import { eq, and } from "drizzle-orm";

const app = new Hono();

app.get("/", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const knowledges = await db
    .select()
    .from(schema.knowledges)
    .where(eq(schema.knowledges.walletAddress, walletAddress));
  return respond.ok(
    c,
    { knowledges },
    "Knowledges retrieved successfully",
    200,
  );
});

app.post("/", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const body = await c.req.json();
  const parsedBody = z
    .object({
      name: z.string().min(1),
      description: z.string().optional(),
      pieceCid: z.string().min(1),
    })
    .safeParse(body);

  if (!parsedBody.success) {
    return respond.err(
      c,
      `Invalid request body: ${parsedBody.error.message}`,
      400,
    );
  }

  const { name, description, pieceCid } = parsedBody.data;

  const [newKnowledge] = await db
    .insert(schema.knowledges)
    .values({
      walletAddress,
      name,
      description,
      pieceCid,
    })
    .returning();

  return respond.ok(
    c,
    { knowledge: newKnowledge },
    "Knowledge created successfully",
    201,
  );
});

// Update a knowledge
app.put("/:id", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const parsedBody = z
    .object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      pieceCid: z.string().min(1).optional(),
    })
    .safeParse(body);

  if (!parsedBody.success) {
    return respond.err(
      c,
      `Invalid request body: ${parsedBody.error.message}`,
      400,
    );
  }

  const updateData = parsedBody.data;

  const [updatedKnowledge] = await db
    .update(schema.knowledges)
    .set(updateData)
    .where(
      and(
        eq(schema.knowledges.id, id),
        eq(schema.knowledges.walletAddress, walletAddress),
      ),
    )
    .returning();

  if (!updatedKnowledge) {
    return respond.err(c, "Knowledge not found or not owned by user", 404);
  }

  return respond.ok(
    c,
    { knowledge: updatedKnowledge },
    "Knowledge updated successfully",
    200,
  );
});

app.delete("/:id", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const id = Number(c.req.param("id"));

  const [deletedKnowledge] = await db
    .delete(schema.knowledges)
    .where(
      and(
        eq(schema.knowledges.id, id),
        eq(schema.knowledges.walletAddress, walletAddress),
      ),
    )
    .returning();

  if (!deletedKnowledge) {
    return respond.err(c, "Knowledge not found or not owned by user", 404);
  }

  return respond.ok(
    c,
    { knowledge: deletedKnowledge },
    "Knowledge deleted successfully",
    200,
  );
});

app.post("/:id/attach/:agentId", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const knowledgeId = Number(c.req.param("id"));
  const agentId = Number(c.req.param("agentId"));

  const [knowledge] = await db
    .select()
    .from(schema.knowledges)
    .where(
      and(
        eq(schema.knowledges.id, knowledgeId),
        eq(schema.knowledges.walletAddress, walletAddress),
      ),
    );

  if (!knowledge) {
    return respond.err(c, "Knowledge not found or not owned by user", 404);
  }

  // Check if already attached
  const [existing] = await db
    .select()
    .from(schema.agentKnowledge)
    .where(
      and(
        eq(schema.agentKnowledge.agentId, agentId),
        eq(schema.agentKnowledge.knowledgeId, knowledgeId),
      ),
    );

  if (existing) {
    return respond.err(c, "Knowledge already attached to agent", 400);
  }

  const [newAttachment] = await db
    .insert(schema.agentKnowledge)
    .values({
      agentId,
      knowledgeId,
    })
    .returning();

  return respond.ok(
    c,
    { attachment: newAttachment },
    "Knowledge attached to agent successfully",
    201,
  );
});

app.delete("/:id/attach/:agentId", authenticated, async (c) => {
  const walletAddress = c.get("userWallet");
  const knowledgeId = Number(c.req.param("id"));
  const agentId = Number(c.req.param("agentId"));

  const [knowledge] = await db
    .select()
    .from(schema.knowledges)
    .where(
      and(
        eq(schema.knowledges.id, knowledgeId),
        eq(schema.knowledges.walletAddress, walletAddress),
      ),
    );

  if (!knowledge) {
    return respond.err(c, "Knowledge not found or not owned by user", 404);
  }

  const [deletedAttachment] = await db
    .delete(schema.agentKnowledge)
    .where(
      and(
        eq(schema.agentKnowledge.agentId, agentId),
        eq(schema.agentKnowledge.knowledgeId, knowledgeId),
      ),
    )
    .returning();

  if (!deletedAttachment) {
    return respond.err(c, "Attachment not found", 404);
  }

  return respond.ok(
    c,
    { attachment: deletedAttachment },
    "Knowledge detached from agent successfully",
    200,
  );
});

export default app;
