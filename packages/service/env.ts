import z from "zod";

const envRaw = Bun.env;

export const env = z.object({
    NODE_ENV: z.string().default("development"),
    GROQ_API_KEY: z.string(),
    PG_URI: z.string(),
    PORT: z.number().min(1).default(3000),
    EVM_PRIVATE_KEY_SYNAPSE: z.string().startsWith("0x").transform((key) => key as `0x${string}`),
    GEMINI_API_KEY: z.string(),
}).parse(envRaw)

export const isProd = env.NODE_ENV === "production";
