import type { DB } from "@/types/db";
import * as schema from "@/db/schema/index";
import { eq, and, desc } from "drizzle-orm";

export class BlogsRepository {
  constructor(private db: DB) {}

  async findAllPublic() {
    return await this.db
      .select()
      .from(schema.blogs)
      .where(eq(schema.blogs.status, "published"))
      .orderBy(desc(schema.blogs.createdAt));
  }

  async findPublicBySlug(slug: string) {
    return await this.db
      .select()
      .from(schema.blogs)
      // Drizzleでは, whereを2回呼び出すことは出来ない
      .where(
        and(
          eq(schema.blogs.slug, slug),
          eq(schema.blogs.status, "published")
        )
      )
      .get();
  }
}
