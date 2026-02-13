import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema/index";
import { postsRoute } from "@/server/posts";
import { worksRoute } from "@/server/works";
import { booksRoute } from "@/server/books";
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

// エラーハンドリング
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export { app };
