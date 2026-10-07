import { z } from 'zod';

export const localeSchema = z.enum(['fr', 'en', 'ko']);
export const textSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300),
  description: z.string().trim().max(5000),
}).strict();
const webUrl = z.url().refine(value => ['https:', 'http:'].includes(new URL(value).protocol), 'HTTP(S) required');
const date = z.iso.date().nullable();
export const profileSchema = z.object({ name: z.string().trim().min(1).max(200), githubUrl: webUrl.nullable() }).strict();
export const entrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  kind: z.enum(['skill', 'project', 'experience', 'education']),
  url: webUrl.nullable(), tags: z.array(z.string().trim().min(1).max(80)).max(20),
  startDate: date, endDate: date, position: z.number().int().min(0),
}).strict().refine(value => !value.startDate || !value.endDate || value.endDate >= value.startDate, 'Invalid date range');
