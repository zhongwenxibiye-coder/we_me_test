import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { creativeWorksTable } from "./creative-works";

export const creativeEpisodesTable = pgTable("creative_episodes", {
  id: serial("id").primaryKey(),
  workId: integer("work_id")
    .notNull()
    .references(() => creativeWorksTable.id, { onDelete: "cascade" }),
  episodeNumber: integer("episode_number").notNull().default(1),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
});

export type CreativeEpisode = typeof creativeEpisodesTable.$inferSelect;
