import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { respond } from "../lib/Router";
import { authenticated } from "../middleware/auth";
import db from "../db/client";
import schema from "../db/schema";
import { eq } from "drizzle-orm";
import { env } from "../env";
import z from "zod";
import { jsonParse } from "../lib/json";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});
const app = new Hono();

app.post("/logs", authenticated, async (ctx) => {
  const logs = db
    .select()
    .from(schema.economyLog)
    .orderBy(schema.economyLog.timestamp);

  return respond.ok(ctx, { logs }, "Economy logs retrieved", 200);
});

const neededSchema = z.object({
  witness: z
    .string()
    .describe(
      "A short sentence describing the interaction from the point of view of Agent A",
    ),
  challenge: z
    .string()
    .describe(
      "A short sentence describing from the point of view of Agent B a challenge or a question to Agent A regarding the interaction",
    ),
});
export async function interactionNotice(args: {
  agentA: { address: string };
  agentB: { address: string };
  intent: string;
}) {
  const [agentA] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.address, args.agentA.address))
    .limit(1);
  const [agentB] = await db
    .select()
    .from(schema.agents)
    .where(eq(schema.agents.address, args.agentB.address))
    .limit(1);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `Agent A (${agentA.name || agentA.address}) intends to ${args.intent} with Agent B (${agentB.name || agentB.address}).
        Agent A : ${JSON.stringify(agentA, null, 2)}
        Agent B : ${JSON.stringify(agentB, null, 2)}

        provide a json resposne {witness: string, challenge: string} where:
        - witness: a short sentence describing from the point of view of Agent A the interaction between these agents as if the interaction already happened
        - challenge: a short sentence describing from the point of view of Agent B a challenge or a question to Agent A regarding the interaction
        `,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: neededSchema,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  const content = neededSchema.parse(jsonParse(response.text));

  db.insert(schema.economyLog).values({
    initiator: agentA.address,
    intent: args.intent,
    witness: content.witness,

    keeper: agentB.address,
    challenge: content.challenge,

    timestamp: new Date(),
  });
}

export default app;
