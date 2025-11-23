import z from "zod";

const envRaw = Bun.env;

export const env = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    GROQ_API_KEY: z.string(),
    PG_URI: z.string(),
    PORT: z.string().default("3000").transform((port) => parseInt(port)),
}).parse(envRaw);

export const isProd = env.NODE_ENV === "production";
