import type { CvText, DraftDocument, DraftItem, Locale, PublicCv } from '@portfolio/contracts';

// Builds an editable draft from the public CV, for the demo of the admin area. Only published,
// public content is used: no private draft or unpublished translation ever reaches a visitor.

/** A separate copy each time: the French text and each "reviewed source" must not share an object. */
const plain = ({ title, subtitle, description }: CvText): CvText => ({ title, subtitle, description });

export function draftFromPublicCv(cvs: Record<Locale, PublicCv>): DraftDocument {
  const translation = (text: CvText & { fallback: boolean }, source: CvText) =>
    text.fallback ? null : { text: plain(text), reviewedSource: plain(source) };

  const { fr, en, ko } = cvs;
  const profileSource = plain(fr.profile.text);
  const profile: DraftItem = {
    id: 'profile', kind: 'profile', name: fr.profile.name, githubUrl: fr.profile.githubUrl, countryCode: fr.profile.countryCode,
    url: null, tags: [], startDate: null, endDate: null,
    translations: {
      fr: { text: plain(profileSource), reviewedSource: plain(profileSource) },
      en: translation(en.profile.text, profileSource),
      ko: translation(ko.profile.text, profileSource),
    },
  };

  const entries = fr.entries.map((entry): DraftItem => {
    const source = plain(entry.text);
    const inLocale = (cv: PublicCv) => cv.entries.find(other => other.id === entry.id)?.text;
    const enText = inLocale(en);
    const koText = inLocale(ko);
    return {
      id: entry.id, kind: entry.kind, name: '', githubUrl: null, countryCode: null,
      url: entry.url, tags: [...entry.tags], startDate: entry.startDate, endDate: entry.endDate,
      translations: {
        fr: { text: plain(source), reviewedSource: plain(source) },
        en: enText ? translation(enText, source) : null,
        ko: koText ? translation(koText, source) : null,
      },
    };
  });

  return { items: [profile, ...entries] };
}

const sameText = (a: CvText | null, b: CvText) =>
  !!a && a.title === b.title && a.subtitle === b.subtitle && a.description === b.description;

/**
 * Preview of a draft in one language, as the server computes it (apps/api/src/admin/documents.ts):
 * a translation is used only if it was reviewed against the current French text.
 */
export function previewDraft(document: DraftDocument, locale: Locale): PublicCv {
  const localize = (item: DraftItem) => {
    const candidate = item.translations[locale];
    const current = locale === 'fr' || (!!candidate && sameText(candidate.reviewedSource, item.translations.fr.text));
    const text = current && candidate ? candidate.text : item.translations.fr.text;
    return { ...text, locale: current ? locale : ('fr' as const), fallback: !current };
  };
  const profile = document.items.find(item => item.kind === 'profile')!;
  return {
    locale,
    profile: { name: profile.name.trim(), githubUrl: profile.githubUrl, countryCode: profile.countryCode ?? null, text: localize(profile) },
    entries: document.items.filter(item => item.kind !== 'profile').map(item => ({
      id: item.id, kind: item.kind as Exclude<DraftItem['kind'], 'profile'>, url: item.url, tags: item.tags,
      startDate: item.startDate, endDate: item.endDate, text: localize(item),
    })),
  };
}
