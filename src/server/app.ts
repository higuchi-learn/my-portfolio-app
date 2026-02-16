import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema/index";
import { blogsRoute } from "@/server/blogs";
import { worksRoute } from "@/server/works";
import { booksRoute } from "@/server/books";
import { adminBlogs } from "@/server/admin/blogs";
import { adminWorks } from "@/server/admin/works";
import { adminBooks } from "@/server/admin/books";
import { adminPosts } from "@/server/admin/posts";
import { AppEnv } from "@/types/context";

// Honoアプリケーションの作成
const app = new Hono<AppEnv>().basePath("/api");

// dbをコンテキストにセットするミドルウェア)
app.use("*", async (c, next) => {
  const d1 = c.env?.my_portfolio_app;
  if (d1) {
    const db = drizzle(d1, { schema });
    c.set("db", db);
  }
  await next();
});

// 動作確認用
app.get("/", (c) => c.json({ ok: true }));

app.route("/blogs",blogsRoute);
app.route("/works",worksRoute);
app.route("/books",booksRoute);
app.route("/admin/blogs", adminBlogs);
app.route("/admin/works", adminWorks);
app.route("/admin/books", adminBooks);
app.route("/admin/posts", adminPosts);

// エラーハンドリング
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export { app };
