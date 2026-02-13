import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { ArticleStatus } from "./common";

export const books = sqliteTable("books", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  tags: text("tags"),
  status: text("status")
    .$type<ArticleStatus>()
    .notNull()
    .default("draft"),
  rating: integer("rating").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
},
(table) => [
  check(
    "rating_range_check",
    sql`${table.rating} BETWEEN 1 AND 5`
  ),
  check(
    "status_check",
    sql`${table.status} IN ('draft','published','archived')`
  ),
]
);
