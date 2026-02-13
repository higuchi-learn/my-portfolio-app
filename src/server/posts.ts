import { Hono } from "hono";
import { PostsRepository } from "@/server/repositories/posts";
import { AppEnv } from "@/types/context";

export const postsRoute = new Hono<AppEnv>();

// GET(/posts) - 全ての投稿を取得
postsRoute.get("/", async (c) => {
  const db = c.get("db");
  const repository = new PostsRepository(db);
  const result = await repository.findAllPublic();
  return c.json(result);
});

// GET(/posts/:slug) - slugの投稿を取得
postsRoute.get("/:slug", async (c) => {
  const db = c.get("db");
  const repository = new PostsRepository(db);
  const slug = c.req.param("slug");
  const result = await repository.findPublicBySlug(slug);
  if (!result) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(result);
});
