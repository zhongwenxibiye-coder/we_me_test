import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { mentorsTable } from "./mentors";

export const mentorArticlesTable = pgTable("mentor_articles", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id")
    .notNull()
    .references(() => mentorsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export type MentorArticle = typeof mentorArticlesTable.$inferSelect;
