import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const linksTable = sqliteTable("links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  url: text("url").notNull(),
  redirects: integer("redirects").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type InsertLink = typeof linksTable.$inferInsert;
export type SelectLink = typeof linksTable.$inferSelect;

export const redirectsTable = sqliteTable("redirects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  linkId: integer("link_id")
    .references(() => linksTable.id, { onDelete: "cascade" })
    .notNull(),
  location: text("location"),
  language: text("language"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type InsertRedirect = typeof redirectsTable.$inferInsert;
export type SelectRedirect = typeof redirectsTable.$inferSelect;
