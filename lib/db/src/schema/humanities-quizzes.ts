import { pgTable, text, serial, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const humanitiesQuizzesTable = pgTable("humanities_quizzes", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: boolean("answer").notNull(),
  explanation: text("explanation").notNull().default(""),
  scheduledDate: date("scheduled_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HumanitiesQuiz = typeof humanitiesQuizzesTable.$inferSelect;
