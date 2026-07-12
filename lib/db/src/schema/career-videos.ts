import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const careerVideosTable = pgTable("career_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CareerVideo = typeof careerVideosTable.$inferSelect;
