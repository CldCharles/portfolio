import type { RefObject } from "react";
import type { CVData, Locale } from "../../types";

type CvPreviewProps = {
  cv: CVData;
  locale: Locale;
  previewRef: RefObject<HTMLElement>;
  texts: {
    printNote: string;
    summary: string;
    skills: string;
    experience: string;
    education: string;
  };
};

export function CvPreview({ cv, locale, previewRef, texts }: CvPreviewProps) {
  return (
    <aside className="print-shell rounded-[24px] border border-line bg-white/80 p-5 shadow-[var(--shadow-soft)] print:border-none print:bg-transparent print:p-0">
      <p className="print-hidden mb-3.5 text-sm text-muted">{texts.printNote}</p>
      <article
        className="print-sheet aspect-[1/1.414] w-full rounded-[24px] border border-black/10 bg-[#fcfcfb] p-8 text-ink"
        ref={previewRef}
      >
        <header className="flex flex-col gap-4 border-b border-black/12 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mb-2 text-4xl">{cv.name}</h2>
            <p className="text-muted">{cv.title[locale]}</p>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted sm:items-end">
            <span>{cv.email}</span>
            <span>{cv.phone}</span>
            <span>{cv.location}</span>
            <span>{cv.website}</span>
          </div>
        </header>

        <section className="mt-6">
          <h3 className="mb-3 text-[0.82rem] uppercase tracking-[0.08em] text-zinc-700">
            {texts.summary}
          </h3>
          <p>{cv.summary[locale]}</p>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-[0.82rem] uppercase tracking-[0.08em] text-zinc-700">
            {texts.skills}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {cv.skills[locale].map((skill) => (
              <li
                className="rounded-full border border-line bg-[#f1f1ef] px-3 py-2 text-sm"
                key={skill}
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-[0.82rem] uppercase tracking-[0.08em] text-zinc-700">
            {texts.experience}
          </h3>
          {cv.experience.map((item) => (
            <div className="mt-4 first:mt-0" key={item.id}>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                <strong>{item.role[locale]}</strong>
                <span className="text-sm text-muted">{item.period}</span>
              </div>
              <p className="text-muted">{item.company}</p>
              <p className="mt-2">{item.achievements[locale]}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-[0.82rem] uppercase tracking-[0.08em] text-zinc-700">
            {texts.education}
          </h3>
          {cv.education.map((item) => (
            <div className="mt-4 first:mt-0" key={item.id}>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                <strong>{item.degree[locale]}</strong>
                <span className="text-sm text-muted">{item.period}</span>
              </div>
              <p className="text-muted">{item.school}</p>
            </div>
          ))}
        </section>
      </article>
    </aside>
  );
}
