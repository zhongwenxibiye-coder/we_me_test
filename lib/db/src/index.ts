import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function extractUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/postgresql:\/\/[^\s"']+/);
  return match ? match[0] : raw.trim();
}

const connectionString =
  extractUrl(process.env.SUPABASE_DATABASE_URL) ||
  extractUrl(process.env.DATABASE_URL);

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set.");
}

const isSupabase = connectionString.includes("supabase.com");

export const pool = new Pool({
  connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
