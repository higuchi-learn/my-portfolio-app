import { Hono } from "hono";
import { worksRepository } from "@/server/repositories/admin/works";
import { createWorkSchema } from "@/db/posts/work-zod";
import { AppEnv } from "@/types/context";

export const adminWorks = new Hono<AppEnv>();

adminWorks.get("/", async (c) => {
  const db = c.get("db");
  const repo = worksRepository(db);
  const works = await repo.findAll();
  return c.json(works);
});

adminWorks.get("/:slug", async (c) => {
  const db = c.get("db");
  const repo = worksRepository(db);
  const slug = c.req.param("slug");
  const work = await repo.findBySlug(slug);

  if (!work) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(work);
});

adminWorks.post("/create", async (c) => {
  const db = c.get("db");
  const repo = worksRepository(db);

  const body = await c.req.json();

  const parsed = createWorkSchema.safeParse(body);

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
    const updatedWork = await repo.updateBySlug(parsed.data.slug, {
      title: parsed.data.title,
      description: parsed.data.description,
      thumbnail: parsed.data.thumbnail,
      content: parsed.data.content,
      techStack: parsed.data.techStack,
      repositoryUrl: parsed.data.repositoryUrl,
      siteUrl: parsed.data.siteUrl,
      status: parsed.data.status,
    });

    return c.json(updatedWork, 200);
  }

  const work = await repo.create(parsed.data);

  return c.json(work, 201);
});

export default adminWorks;
