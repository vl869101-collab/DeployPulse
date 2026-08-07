import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const MonitorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Invalid URL format').max(2048),
  type: z.enum(['https', 'http', 'tcp', 'dns', 'keyword', 'ping']).optional().default('https'),
  interval: z.number().int().min(10).max(1440).optional().default(60),
  timeout: z.number().int().min(1).max(120).optional().default(10),
  retries: z.number().int().min(0).max(10).optional().default(3),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
});

export const StatusPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).nullable().optional(),
  customDomain: z.string().max(255).nullable().optional(),
  public: z.boolean().optional().default(true),
  monitorIds: z.array(z.string()).max(50).optional().default([]),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues.map((i) => i.message).join(', ') };
}
