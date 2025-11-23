import { SQL } from "bun";
import { env } from "../env";

const sql = new SQL(env.PG_URI);

async function runMigration() {
  try {
    const migrationSQL = await Bun.file('./db/down.sql').text();
    await sql.unsafe(migrationSQL);
    console.log('Db clearance  successfully');
  } catch (error) {
    console.error('down - failed:', error);
    process.exit(1);
  }
}

runMigration();
