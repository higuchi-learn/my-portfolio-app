import { Hono } from "hono";
import { BooksRepository } from "./repositories/books";
import { AppEnv } from "@/types/context";

export const booksRoute = new Hono<AppEnv>();

// GET(/books) - 全ての投稿を取得
booksRoute.get("/", async (c) => {
  const db = c.get("db");
  const repository = new BooksRepository(db);
  const result = await repository.findAllPublic();
  return c.json(result);
});

// GET(/books/:slug) - slugの投稿を取得
booksRoute.get("/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");
  const repository = new BooksRepository(db);
  const result = await repository.findPublicBySlug(slug);
  if (!result) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(result);
});
