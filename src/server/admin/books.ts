import { Hono } from "hono";
import { booksRepository } from "@/server/repositories/admin/books";
import { createBookSchema } from "@/db/posts/book-zod";
import { AppEnv } from "@/types/context";

export const adminBooks = new Hono<AppEnv>();

adminBooks.get("/", async (c) => {
  const db = c.get("db");
  const repo = booksRepository(db);
  const books = await repo.findAll();
  return c.json(books);
});

adminBooks.get("/:slug", async (c) => {
  const db = c.get("db");
  const repo = booksRepository(db);
  const slug = c.req.param("slug");
  const book = await repo.findBySlug(slug);

  if (!book) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(book);
});

adminBooks.post("/create", async (c) => {
  const db = c.get("db");
  const repo = booksRepository(db);

  const body = await c.req.json();

  const parsed = createBookSchema.safeParse(body);

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

  const book = await repo.create(parsed.data);

  return c.json(book, 201);
});

export default adminBooks;
