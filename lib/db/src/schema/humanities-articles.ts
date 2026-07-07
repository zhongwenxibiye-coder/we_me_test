import { pgTable, text, serial, boolean, timestamp, integer, json } from "drizzle-orm/pg-core";

export const humanitiesArticlesTable = pgTable("humanities_articles", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull().default("text"),
  content: text("content").notNull().default(""),
  cardPages: json("card_pages").notNull().default([]),
  authorName: text("author_name").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HumanitiesArticle = typeof humanitiesArticlesTable.$inferSelect;
