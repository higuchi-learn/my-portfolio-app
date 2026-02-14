import { z } from "zod";

export const createWorkSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  techStack: z.string().optional(),
  repositoryUrl: z.string().url().optional(),
  siteUrl: z.string().url().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
