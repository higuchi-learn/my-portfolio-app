import { z } from "zod";

export const createBookSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string().optional(),
  content: z.string().min(1),
  tags: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});
