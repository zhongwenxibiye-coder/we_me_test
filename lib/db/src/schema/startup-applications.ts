import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const startupApplicationsTable = pgTable("startup_applications", {
  id: serial("id").primaryKey(),
  founderName: text("founder_name").notNull(),
  email: text("email").notNull(),
  registrationStatus: text("registration_status").notNull(),
  startupIdea: text("startup_idea").notNull(),
  readiness: text("readiness").notNull(),
  readinessDetail: text("readiness_detail").notNull().default(""),
  ideaReason: text("idea_reason").notNull(),
  experience: text("experience").notNull(),
  team: text("team").notNull(),
  result: text("result"),
  resultReason: text("result_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StartupApplication = typeof startupApplicationsTable.$inferSelect;
