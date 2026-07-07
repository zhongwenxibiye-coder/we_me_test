import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";

export const jobCategoriesTable = pgTable("job_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export type JobCategory = typeof jobCategoriesTable.$inferSelect;
