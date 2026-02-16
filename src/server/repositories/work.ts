import type { DB } from "@/types/db";
import * as schema from "@/db/schema/index";
import { eq, and, desc } from "drizzle-orm";

export class WorksRepository {
  constructor(private db: DB) {}

  async findAllPublic() {
    return await this.db
      .select()
      .from(schema.works)
      .where(eq(schema.works.status, "published"))
      .orderBy(desc(schema.works.createdAt));
  }

  async findPublicBySlug(slug: string) {
    return await this.db
      .select()
      .from(schema.works)
      // Drizzleでは, whereを2回呼び出すことは出来ない
      .where(
        and(
          eq(schema.works.slug, slug),
          eq(schema.works.status, "published")
        )
      )
      .get();
  }
}
