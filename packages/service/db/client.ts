import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "../env";
import schema from "./schema";

const db: NodePgDatabase<typeof schema> = drizzle(env.PG_URI, {
  schema,
  casing: "snake_case",
});

export default db;
