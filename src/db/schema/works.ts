import { sqliteTable, text, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { ArticleStatus } from "./common";

export const works = sqliteTable("works", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  content: text("content").notNull(),
  techStack: text("tech_stack"),
  repositoryUrl: text("repository_url"),
  siteUrl: text("site_url"),
  status: text("status")
    .$type<ArticleStatus>()
    .notNull()
    .default("draft"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
},
(table) => [
  check(
    "status_check",
    sql`${table.status} IN ('draft','published','archived')`
  ),
]
);
