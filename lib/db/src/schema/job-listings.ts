import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";

export interface LearningItem {
  title: string;
  content: string;
}

export const jobListingsTable = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  learning: json("learning").$type<LearningItem[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JobListing = typeof jobListingsTable.$inferSelect;
