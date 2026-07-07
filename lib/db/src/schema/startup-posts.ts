import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const startupPostsTable = pgTable("startup_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  organizationName: text("organization_name").notNull().default(""),
  applicationUrl: text("application_url").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StartupPost = typeof startupPostsTable.$inferSelect;
