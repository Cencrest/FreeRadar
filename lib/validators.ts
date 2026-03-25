import { z } from "zod";

export const listingSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  zip: z.string().trim().max(10).optional(),
  category: z.string().trim().max(50).optional()
});

export const alertSchema = z.object({
  keyword: z.string().trim().min(2).max(100),
  zip: z.string().trim().max(10).optional().or(z.literal("")),
  radius_miles: z.coerce.number().min(1).max(200).default(25),
  category: z.string().trim().max(50).optional().or(z.literal(""))
});

export const submissionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  source_url: z.string().trim().url().optional().or(z.literal("")),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(20).optional().or(z.literal("")),
  zip: z.string().trim().max(10).optional().or(z.literal(""))
});

export const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100)
});
