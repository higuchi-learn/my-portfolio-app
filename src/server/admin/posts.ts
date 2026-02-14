import { Hono } from "hono";
import { postsRepository } from "@/server/repositories/admin/posts";
import { createPostSchema } from "@/db/posts/post-zod";
import { AppEnv } from "@/types/context";

export const adminPosts = new Hono<AppEnv>();

adminPosts.get("/", async (c) => {
  const db = c.get("db");
  const repo = postsRepository(db);
  const posts = await repo.findAll();
  return c.json(posts);
});

adminPosts.get("/:slug", async (c) => {
  const db = c.get("db");
  const repo = postsRepository(db);
  const slug = c.req.param("slug");
  const post = await repo.findBySlug(slug);

  if (!post) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(post);
});

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

  const existing = await repo.findBySlug(parsed.data.slug);

  if (existing) {
    return c.json(
      {
        message: "Slug already exists",
      },
      409
    );
  }

  const post = await repo.create(parsed.data);

  return c.json(post, 201);
});

export default adminPosts;
