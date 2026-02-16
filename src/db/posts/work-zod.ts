import { z } from "zod";

export const createWorkSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string().optional(),
  content: z.string().min(1),
  techStack: z.string().optional(),
  repositoryUrl: z.url().optional(),
  siteUrl: z.url().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
