import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const creativeWorksTable = pgTable("creative_works", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull().default(""),
  thumbnailUrl: text("thumbnail_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CreativeWork = typeof creativeWorksTable.$inferSelect;
