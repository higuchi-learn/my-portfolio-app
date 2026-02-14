import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema/index";
import { postsRoute } from "@/server/posts";
import { worksRoute } from "@/server/works";
import { booksRoute } from "@/server/books";
import { adminPosts } from "@/server/admin/posts";
import { adminWorks } from "@/server/admin/works";
import { adminBooks } from "@/server/admin/books";
import { AppEnv } from "@/types/context";

// Honoアプリケーションの作成
const app = new Hono<AppEnv>();

// dbをコンテキストにセットするミドルウェア)
app.use("*", async (c, next) => {
  const db = drizzle(c.env.my_portfolio_app, { schema });
  c.set("db", db);
  await next();
});

// 動作確認用
app.get("/", (c) => c.json({ ok: true }));

app.route("/posts",postsRoute);
app.route("/works",worksRoute);
app.route("/books",booksRoute);
app.route("/admin/posts", adminPosts);
app.route("/admin/works", adminWorks);
app.route("/admin/books", adminBooks);

// エラーハンドリング
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export { app };
