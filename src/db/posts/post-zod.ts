import { z } from "zod";

export const createPostSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  tags: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
