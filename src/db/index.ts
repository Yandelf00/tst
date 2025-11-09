import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // imports users, buyers, sellers, etc.

const databaseUrl = process.env.DATABASE_URL;
const useNoVerifySsl = Boolean(databaseUrl && databaseUrl.includes("sslmode=no-verify"));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useNoVerifySsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
