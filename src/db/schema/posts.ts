import { sqliteTable, text, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { ArticleStatus } from "./common";

export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  content: text("content").notNull(),
  tags: text("tags"),
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
