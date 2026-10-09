import { z } from 'zod';

export const localeSchema = z.enum(['fr', 'en', 'ko']);
export const textSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300),
  description: z.string().trim().max(5000),
}).strict();
const webUrl = z.url().refine(value => ['https:', 'http:'].includes(new URL(value).protocol), 'HTTP(S) required');
// Keep the supplied precision; an unknown month/day must not be invented.
const date = z.union([
  z.iso.date(),
  z.string().regex(/^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2]))?$/),
]).nullable();
const earliest = (value: string) => value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
const latest = (value: string) => value.length === 4 ? `${value}-12-31` : value.length === 7 ? `${value}-31` : value;
// Region names come from Intl.DisplayNames in each locale; reject codes it does not know.
const countryCode = z.string().regex(/^[A-Z]{2}$/)
  .refine(value => value !== 'ZZ' && new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' }).of(value) !== undefined, 'Unknown region code');
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(200), githubUrl: webUrl.nullable(), countryCode: countryCode.nullable().default(null),
}).strict();
export const entrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  kind: z.enum(['skill', 'project', 'experience', 'education', 'language']),
  url: webUrl.nullable(), tags: z.array(z.string().trim().min(1).max(80)).max(20),
  startDate: date, endDate: date, position: z.number().int().min(0),
}).strict().refine(value => !value.startDate || !value.endDate || latest(value.endDate) >= earliest(value.startDate), 'Invalid date range');
