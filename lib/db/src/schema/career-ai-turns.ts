import { pgTable, text, integer, primaryKey, jsonb, timestamp } from "drizzle-orm/pg-core";

// One immutable answer path per member/Korea day. No raw user answers are stored.
export const careerAiTurnsTable = pgTable("career_ai_turns", {
  memberId: text("member_id").notNull(),
  day: text("day").notNull(),
  turn: integer("turn").notNull(),
  requestHash: text("request_hash").notNull(),
  nextPrefixHash: text("next_prefix_hash"),
  status: text("status").notNull(),
  response: jsonb("response"),
  attempts: integer("attempts").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.memberId, table.day, table.turn] })]);
