import { SQL } from "bun";
import { env } from "../env";

const sql = new SQL(env.PG_URI);

async function runMigration() {
  try {
    const migrationSQL = await Bun.file("./db/migration.sql").text();
    await sql.unsafe(migrationSQL);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
