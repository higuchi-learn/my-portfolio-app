import type { DB } from "@/types/db";
import * as schema from "@/db/schema/index";
import { eq, and } from "drizzle-orm";

export class BooksRepository {
  constructor(private db: DB) {}

  async findAllPublic() {
    return await this.db
      .select()
      .from(schema.books)
      .where(eq(schema.books.status, "published"));
  }

  async findPublicBySlug(slug: string) {
    return await this.db
      .select()
      .from(schema.books)
      // Drizzleでは, whereを2回呼び出すことは出来ない
      .where(
        and(
          eq(schema.books.slug, slug),
          eq(schema.books.status, "published")
        )
      )
      .get();
  }
}
