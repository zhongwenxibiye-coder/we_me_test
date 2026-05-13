import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const creativeWorkSubmissionsTable = pgTable("creative_work_submissions", {
  id: serial("id").primaryKey(),
  authorName: text("author_name").notNull(),
  email: text("email").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CreativeWorkSubmission = typeof creativeWorkSubmissionsTable.$inferSelect;
