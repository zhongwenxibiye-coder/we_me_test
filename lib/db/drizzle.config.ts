import { defineConfig } from "drizzle-kit";
import path from "path";

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

const url =
  extractAndEncodeUrl(process.env.SUPABASE_DATABASE_URL) ||
  extractAndEncodeUrl(process.env.DATABASE_URL);

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
