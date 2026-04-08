import type { Dispatch, SetStateAction } from "react";
import type { CVData, Locale } from "../../../types";

type CvEditorProps = {
  cv: CVData;
  locale: Locale;
  localeLabels: Record<Locale, string>;
  skillText: string;
  texts: {
    personalInfo: string;
    summary: string;
    skills: string;
    experience: string;
    education: string;
    addExperience: string;
    addEducation: string;
  };
  onChange: Dispatch<SetStateAction<CVData>>;
  onUpdateLocalizedField: (key: "title" | "summary", value: string) => void;
  onSkillsChange: (value: string) => void;
  onAddExperience: () => void;
  onAddEducation: () => void;
};

export function CvEditor({
  cv,
  locale,
  localeLabels,
  skillText,
  texts,
  onChange,
  onUpdateLocalizedField,
  onSkillsChange,
  onAddExperience,
  onAddEducation,
}: CvEditorProps) {
  return (
    <>
      <div className="form-grid">
        <label>
          <span>{texts.personalInfo} - Nom</span>
          <input value={cv.name} onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label>
          <span>{texts.personalInfo} - Email</span>
          <input value={cv.email} onChange={(event) => onChange((current) => ({ ...current, email: event.target.value }))} />
        </label>
        <label>
          <span>{texts.personalInfo} - Telephone</span>
          <input value={cv.phone} onChange={(event) => onChange((current) => ({ ...current, phone: event.target.value }))} />
        </label>
        <label>
          <span>{texts.personalInfo} - Ville</span>
          <input value={cv.location} onChange={(event) => onChange((current) => ({ ...current, location: event.target.value }))} />
        </label>
        <label className="full-width">
          <span>{texts.personalInfo} - Site web</span>
          <input value={cv.website} onChange={(event) => onChange((current) => ({ ...current, website: event.target.value }))} />
        </label>
        <label className="full-width">
          <span>{texts.personalInfo} - Titre</span>
          <input value={cv.title[locale]} onChange={(event) => onUpdateLocalizedField("title", event.target.value)} />
        </label>
        <label className="full-width">
          <span>{texts.summary}</span>
          <textarea rows={4} value={cv.summary[locale]} onChange={(event) => onUpdateLocalizedField("summary", event.target.value)} />
        </label>
        <label className="full-width">
          <span>{texts.skills}</span>
          <textarea rows={3} value={skillText} onChange={(event) => onSkillsChange(event.target.value)} />
        </label>
      </div>

      <section className="editor-subsection">
        <div className="subsection-title-row">
          <h3>{texts.experience}</h3>
          <button className="inline-action" type="button" onClick={onAddExperience}>
            {texts.addExperience}
          </button>
        </div>
        {cv.experience.map((item) => (
          <article className="entry-card" key={item.id}>
            <label>
              <span>Entreprise</span>
              <input
                value={item.company}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    experience: current.experience.map((entry) =>
                      entry.id === item.id ? { ...entry, company: event.target.value } : entry,
                    ),
                  }))
                }
              />
            </label>
            <label>
              <span>Periode</span>
              <input
                value={item.period}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    experience: current.experience.map((entry) =>
                      entry.id === item.id ? { ...entry, period: event.target.value } : entry,
                    ),
                  }))
                }
              />
            </label>
            <label className="full-width">
              <span>Role ({localeLabels[locale]})</span>
              <input
                value={item.role[locale]}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    experience: current.experience.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, role: { ...entry.role, [locale]: event.target.value } }
                        : entry,
                    ),
                  }))
                }
              />
            </label>
            <label className="full-width">
              <span>Impact ({localeLabels[locale]})</span>
              <textarea
                rows={3}
                value={item.achievements[locale]}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    experience: current.experience.map((entry) =>
                      entry.id === item.id
                        ? {
                            ...entry,
                            achievements: { ...entry.achievements, [locale]: event.target.value },
                          }
                        : entry,
                    ),
                  }))
                }
              />
            </label>
          </article>
        ))}
      </section>

      <section className="editor-subsection">
        <div className="subsection-title-row">
          <h3>{texts.education}</h3>
          <button className="inline-action" type="button" onClick={onAddEducation}>
            {texts.addEducation}
          </button>
        </div>
        {cv.education.map((item) => (
          <article className="entry-card" key={item.id}>
            <label>
              <span>Ecole</span>
              <input
                value={item.school}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    education: current.education.map((entry) =>
                      entry.id === item.id ? { ...entry, school: event.target.value } : entry,
                    ),
                  }))
                }
              />
            </label>
            <label>
              <span>Periode</span>
              <input
                value={item.period}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    education: current.education.map((entry) =>
                      entry.id === item.id ? { ...entry, period: event.target.value } : entry,
                    ),
                  }))
                }
              />
            </label>
            <label className="full-width">
              <span>Diplome ({localeLabels[locale]})</span>
              <input
                value={item.degree[locale]}
                onChange={(event) =>
                  onChange((current) => ({
                    ...current,
                    education: current.education.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, degree: { ...entry.degree, [locale]: event.target.value } }
                        : entry,
                    ),
                  }))
                }
              />
            </label>
          </article>
        ))}
      </section>
    </>
  );
}
