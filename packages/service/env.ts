const envRaw = Bun.env;

export const env = {
    NODE_ENV: envRaw.NODE_ENV || "development",
    GROQ_API_KEY: envRaw.GROQ_API_KEY,
    PG_URI: envRaw.PG_URI,
    PORT: parseInt(envRaw.PORT || "3000"),
} as {
    NODE_ENV: string;
    GROQ_API_KEY: string;
    PG_URI: string;
    PORT: number;
};

export const isProd = env.NODE_ENV === "production";
