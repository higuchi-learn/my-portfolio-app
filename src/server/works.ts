import { Hono } from "hono";
import { WorksRepository } from "@/server/repositories/work";
import { AppEnv } from "@/types/context";

export const worksRoute = new Hono<AppEnv>();

// GET(/works) - 全ての投稿を取得
worksRoute.get("/", async (c) => {
  const db = c.get("db");
  const repository = new WorksRepository(db);
  const result = await repository.findAllPublic();
  return c.json(result);
});

// GET(/works/:slug) - slugの投稿を取得
worksRoute.get("/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");
  const repository = new WorksRepository(db);
  const result = await repository.findPublicBySlug(slug);
  if (!result) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(result);
});
