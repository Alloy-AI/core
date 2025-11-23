import db from "./client";
import { sql } from "drizzle-orm";

async function dropDatabase() {
  try {
    // Drop tables in reverse order of dependencies
    await db.execute(sql`DROP TABLE IF EXISTS agent_cards CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS chat_history CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS chats CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS agents CASCADE;`);

    console.log("Database dropped successfully.");
  } catch (error) {
    console.error("Error dropping database:", error);
    process.exit(1);
  }
}

dropDatabase();
