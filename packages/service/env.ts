import z from "zod";

const envRaw = Bun.env;

export const env = z
  .object({
    NODE_ENV: z.string().default("development"),
    GROQ_API_KEY: z.string(),
    PG_URI: z.string(),
    PORT: z
      .string()
      .default("3000")
      .transform((port) => parseInt(port, 10)),
    EVM_PRIVATE_KEY_SYNAPSE: z
      .string()
      .startsWith("0x")
      .transform((key) => key as `0x${string}`),
    GEMINI_API_KEY: z.string(),
    ALCHEMY_API_KEY: z.string(),
    EVM_MCP_SERVER_URL: z.string(),
    NAMESTONE_API_KEY: z.string(),
    ENS_DOMAIN: z.string(),
  })
  .parse(envRaw);

export const isProd = env.NODE_ENV === "production";
