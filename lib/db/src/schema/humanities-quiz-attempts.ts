import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { humanitiesQuizzesTable } from "./humanities-quizzes";

export const humanitiesQuizAttemptsTable = pgTable("humanities_quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => humanitiesQuizzesTable.id, { onDelete: "cascade" }),
  sessionKey: text("session_key").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HumanitiesQuizAttempt = typeof humanitiesQuizAttemptsTable.$inferSelect;
