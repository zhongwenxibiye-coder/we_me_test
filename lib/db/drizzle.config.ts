import { defineConfig } from "drizzle-kit";
import path from "path";

function extractUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/postgresql:\/\/[^\s"']+/);
  return match ? match[0] : raw.trim();
}

const url = extractUrl(process.env.SUPABASE_DATABASE_URL) || extractUrl(process.env.DATABASE_URL);

if (!url) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
