import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function extractAndEncodeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/postgresql:\/\/[^\s"']+/);
  if (!match) return raw.trim();
  let url = match[0];
  try {
    const parsed = new URL(url);
    const password = decodeURIComponent(parsed.password);
    parsed.password = encodeURIComponent(password);
    return parsed.toString();
  } catch {
    return url;
  }
}

const connectionString =
  extractAndEncodeUrl(process.env.SUPABASE_DATABASE_URL) ||
  extractAndEncodeUrl(process.env.DATABASE_URL);

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
