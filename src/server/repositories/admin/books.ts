import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DB } from "@/types/db";

export const booksRepository = (db: DB) => ({
  async findAll() {
    return await db
      .select()
      .from(books);
  },

  async findBySlug(slug: string) {
    return await db
      .select()
      .from(books)
      .where(eq(books.slug, slug))
      .get();
  },

  async create(data: {
    slug: string;
    title: string;
    author: string;
    description: string;
    thumbnail?: string;
    content: string;
    tags?: string;
    status?: "draft" | "published" | "archived";
    rating?: number;
  }) {
    const now = new Date().toISOString();

    return await db
      .insert(books)
      .values({
        ...data,
        status: data.status ?? "draft",
        rating: data.rating ?? 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  },

  async findAllPublished() {
    return await db
      .select()
      .from(books)
      .where(eq(books.status, "published"));
  },
});
