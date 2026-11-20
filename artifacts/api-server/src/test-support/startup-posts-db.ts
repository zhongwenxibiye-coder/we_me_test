import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { startupPostsTable } from "../../../../lib/db/src/schema/startup-posts.ts";

// A real PostgreSQL engine in memory. No environment variables, live credentials,
// or copies of the route's filtering logic are used.
export const database = new PGlite();
export const db = drizzle(database);
export { startupPostsTable };

export async function seedStartupPosts() {
  await database.exec(`
    CREATE TABLE startup_posts (
      id serial PRIMARY KEY,
      title text NOT NULL,
      content text NOT NULL DEFAULT '',
      organization_name text NOT NULL DEFAULT '',
      application_url text NOT NULL DEFAULT '',
      start_date text NOT NULL DEFAULT '',
      end_date text NOT NULL DEFAULT '',
      is_active boolean NOT NULL DEFAULT true,
      display_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  // Deliberately insert out of display order, including a tie.
  await db.insert(startupPostsTable).values([
    { id: 1, title: "active deadline", endDate: "2026-09-29", isActive: true, displayOrder: 2 },
    { id: 2, title: "active no deadline", endDate: "", isActive: true, displayOrder: 1 },
    { id: 3, title: "inactive deadline", endDate: "2026-09-29", isActive: false, displayOrder: 0 },
    { id: 4, title: "inactive no deadline", endDate: "", isActive: false, displayOrder: 1 },
    { id: 5, title: "active expired", endDate: "2026-09-01", isActive: true, displayOrder: 0 },
    { id: 6, title: "active future deadline", endDate: "2026-10-01", isActive: true, displayOrder: 1 },
  ]);
}
