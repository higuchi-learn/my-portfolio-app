import { works } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { DB } from "@/types/db";

export const worksRepository = (db: DB) => ({
  async findAll() {
    return await db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt));
  },

  async findBySlug(slug: string) {
    return await db
      .select()
      .from(works)
      .where(eq(works.slug, slug))
      .get();
  },

  async create(data: {
    slug: string;
    title: string;
    description: string;
    thumbnail?: string;
    content: string;
    techStack?: string;
    repositoryUrl?: string;
    siteUrl?: string;
    status?: "draft" | "published" | "archived";
  }) {
    const now = new Date().toISOString();

    return await db
      .insert(works)
      .values({
        ...data,
        status: data.status ?? "draft",
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  },

  async updateBySlug(
    slug: string,
    data: {
      title: string;
      description: string;
      thumbnail?: string;
      content: string;
      techStack?: string;
      repositoryUrl?: string;
      siteUrl?: string;
      status?: "draft" | "published" | "archived";
    }
  ) {
    const now = new Date().toISOString();

    return await db
      .update(works)
      .set({
        ...data,
        status: data.status ?? "draft",
        updatedAt: now,
      })
      .where(eq(works.slug, slug))
      .returning()
      .get();
  },

  async findAllPublished() {
    return await db
      .select()
      .from(works)
      .where(eq(works.status, "published"))
      .orderBy(desc(works.createdAt));
  },
});
