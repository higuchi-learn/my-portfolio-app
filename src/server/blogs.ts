import { Hono } from "hono";
import { BlogRepository } from "@/server/repositories/blogs";
import { AppEnv } from "@/types/context";

export const blogRoute = new Hono<AppEnv>();

// GET(/blogs) - 全ての投稿を取得
blogRoute.get("/", async (c) => {
  const db = c.get("db");
  const repository = new BlogRepository(db);
  const result = await repository.findAllPublic();
  return c.json(result);
});

// GET(/blogs/:slug) - slugの投稿を取得
blogRoute.get("/:slug", async (c) => {
  const db = c.get("db");
  const repository = new BlogRepository(db);
  const slug = c.req.param("slug");
  const result = await repository.findPublicBySlug(slug);
  if (!result) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(result);
});
