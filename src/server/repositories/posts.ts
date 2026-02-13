import type { DB } from "@/types/db";
import * as schema from "@/db/schema/index";
import { eq, and } from "drizzle-orm";

export class PostsRepository {
  constructor(private db: DB) {}

  async findAllPublic() {
    return await this.db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.status, "published"));
  }

  async findPublicBySlug(slug: string) {
    return await this.db
      .select()
      .from(schema.posts)
      // Drizzleでは, whereを2回呼び出すことは出来ない
      .where(
        and(
          eq(schema.posts.slug, slug),
          eq(schema.posts.status, "published")
        )
      )
      .get();
  }
}
