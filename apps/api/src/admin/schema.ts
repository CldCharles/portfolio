import { z } from 'zod';
import { textSchema, profileSchema, entrySchema } from '../cv/schema.js';

const translation = z.object({ text: textSchema, reviewedSource: textSchema.nullable() }).strict();
export const draftItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  kind: z.enum(['profile', 'skill', 'project', 'experience', 'education']),
  name: z.string().max(200), githubUrl: z.string().nullable(),
  url: z.string().nullable(), tags: z.array(z.string()).max(20),
  startDate: z.string().nullable(), endDate: z.string().nullable(),
  translations: z.object({ fr: translation, en: translation.nullable(), ko: translation.nullable() }).strict(),
}).strict().superRefine((item, context) => {
  const checked = item.kind === 'profile'
    ? profileSchema.safeParse({ name: item.name, githubUrl: item.githubUrl })
    : entrySchema.safeParse({ id: item.id, kind: item.kind, url: item.url, tags: item.tags, startDate: item.startDate, endDate: item.endDate, position: 0 });
  if (!checked.success) for (const issue of checked.error.issues) context.addIssue({ code: 'custom', path: issue.path, message: issue.message });
  if ((item.id === 'profile') !== (item.kind === 'profile')) context.addIssue({ code: 'custom', path: ['id'], message: 'Reserved profile id' });
}).transform(item => {
  if (item.kind === 'profile') return { ...item, ...profileSchema.parse({ name: item.name, githubUrl: item.githubUrl }) };
  const { position: _position, ...common } = entrySchema.parse({ id: item.id, kind: item.kind, url: item.url, tags: item.tags, startDate: item.startDate, endDate: item.endDate, position: 0 });
  return { ...item, ...common };
});
export const documentSchema = z.object({ items: z.array(draftItemSchema).min(1).max(100) }).strict().superRefine((document, context) => {
  if (document.items.filter(item => item.kind === 'profile').length !== 1) context.addIssue({ code: 'custom', message: 'Exactly one profile required' });
  if (new Set(document.items.map(item => item.id)).size !== document.items.length) context.addIssue({ code: 'custom', message: 'Duplicate item ids' });
});
export const revisionSchema = z.object({ revision: z.number().int().min(1) }).strict();
export const saveDraftSchema = revisionSchema.extend({ document: documentSchema });
