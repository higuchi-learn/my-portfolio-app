import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DB } from "@/types/db";

export const postsRepository = (db: DB) => ({

  async findAll() {
    return await db
      .select()
      .from(posts);
  },

  // SELECT * FROM posts WHERE slug = 'xxx' LIMIT 1;
  async findBySlug(slug: string) {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .get();
  },

  async create(data: {
    slug: string;
    title: string;
    description: string;
    thumbnail?: string;
    content: string;
    tags?: string;
    status?: "draft" | "published" | "archived";
  }) {
    const now = new Date().toISOString();

    return await db
      .insert(posts)
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
      tags?: string;
      status?: "draft" | "published" | "archived";
    }
  ) {
    const now = new Date().toISOString();

    return await db
      .update(posts)
      .set({
        ...data,
        status: data.status ?? "draft",
        updatedAt: now,
      })
      .where(eq(posts.slug, slug))
      .returning()
      .get();
  },

  async findAllPublished() {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"));
  },
});
