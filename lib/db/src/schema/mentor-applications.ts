import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mentorApplicationsTable = pgTable("mentor_applications", {
  id: serial("id").primaryKey(),
  mentorId: text("mentor_id").notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const insertMentorApplicationSchema = createInsertSchema(
  mentorApplicationsTable,
).omit({ id: true, createdAt: true, status: true, readAt: true });

export type InsertMentorApplication = z.infer<
  typeof insertMentorApplicationSchema
>;
export type MentorApplication = typeof mentorApplicationsTable.$inferSelect;
