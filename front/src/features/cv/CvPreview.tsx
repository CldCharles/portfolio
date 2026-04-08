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
    <aside className="preview-panel">
      <p className="preview-note">{texts.printNote}</p>
      <article className="cv-sheet" ref={previewRef}>
        <header className="cv-header">
          <div>
            <h2>{cv.name}</h2>
            <p>{cv.title[locale]}</p>
          </div>
          <div className="contact-list">
            <span>{cv.email}</span>
            <span>{cv.phone}</span>
            <span>{cv.location}</span>
            <span>{cv.website}</span>
          </div>
        </header>

        <section className="cv-sheet-section">
          <h3>{texts.summary}</h3>
          <p>{cv.summary[locale]}</p>
        </section>

        <section className="cv-sheet-section">
          <h3>{texts.skills}</h3>
          <ul className="tag-list">
            {cv.skills[locale].map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <section className="cv-sheet-section">
          <h3>{texts.experience}</h3>
          {cv.experience.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-heading">
                <strong>{item.role[locale]}</strong>
                <span>{item.period}</span>
              </div>
              <p className="timeline-company">{item.company}</p>
              <p>{item.achievements[locale]}</p>
            </div>
          ))}
        </section>

        <section className="cv-sheet-section">
          <h3>{texts.education}</h3>
          {cv.education.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-heading">
                <strong>{item.degree[locale]}</strong>
                <span>{item.period}</span>
              </div>
              <p className="timeline-company">{item.school}</p>
            </div>
          ))}
        </section>
      </article>
    </aside>
  );
}
