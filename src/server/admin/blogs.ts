import { Hono } from "hono";
import { blogRepository } from "@/server/repositories/admin/blogs";
import { createBlogSchema } from "@/db/posts/blog-zod";
import { AppEnv } from "@/types/context";

export const adminBlogs = new Hono<AppEnv>();

adminBlogs.get("/", async (c) => {
  const db = c.get("db");
  const repo = blogRepository(db);
  const blogs = await repo.findAll();
  return c.json(blogs);
});

adminBlogs.get("/:slug", async (c) => {
  const db = c.get("db");
  const repo = blogRepository(db);
  const slug = c.req.param("slug");
  const blog = await repo.findBySlug(slug);

  if (!blog) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(blog);
});

adminBlogs.post("/create", async (c) => {
  const db = c.get("db");
  const repo = blogRepository(db);

  const body = await c.req.json();

  // バリデーション
  const parsed = createBlogSchema.safeParse(body);

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
    const updatedBlog = await repo.updateBySlug(parsed.data.slug, {
      title: parsed.data.title,
      description: parsed.data.description,
      thumbnail: parsed.data.thumbnail,
      content: parsed.data.content,
      tags: parsed.data.tags,
      status: parsed.data.status,
    });

    return c.json(updatedBlog, 200);
  }

  const blog = await repo.create(parsed.data);

  return c.json(blog, 201);
});

export default adminBlogs;
