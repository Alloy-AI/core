import { defineConfig } from "drizzle-kit";
import { env } from "./env";

//@ts-expect-error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.PG_URI,
  },
  casing: "snake_case",
});
