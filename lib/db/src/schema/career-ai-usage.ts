import { pgTable, text, integer, primaryKey } from "drizzle-orm/pg-core";

// Usage only: no answers, prompts or recommendations are persisted here.
export const careerAiUsageTable = pgTable("career_ai_usage", {
  scope: text("scope").notNull(),
  day: text("day").notNull(),
  used: integer("used").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.scope, table.day] })]);
