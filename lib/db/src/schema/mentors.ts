import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const mentorsTable = pgTable("mentors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  major: text("major").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  photoUrl: text("photo_url"),
  headlineText: text("headline_text").notNull().default(""),
  sublineText: text("subline_text").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarColor: text("avatar_color").notNull().default("bg-amber-200"),
  initial: text("initial").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Mentor = typeof mentorsTable.$inferSelect;
