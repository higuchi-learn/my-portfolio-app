import { Hono } from "hono";
import { postsRepository } from "@/server/repositories/admin/posts";
import { createPostSchema } from "@/db/posts/post-zod";
import { AppEnv } from "@/types/context";

export const adminPosts = new Hono<AppEnv>();

adminPosts.post("/create", async (c) => {
  const db = c.get("db");
  const repo = postsRepository(db);

  const body = await c.req.json();

  // バリデーション
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
  return c.json(
    {
      message: "Validation failed",
      errors: parsed.error.issues,
    },
    400
    );
  }

  const post = await repo.create(parsed.data);

  return c.json(post, 201);
});

export default adminPosts;
