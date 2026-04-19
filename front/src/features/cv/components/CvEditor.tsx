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
    company: string;
    period: string;
    role: string;
    impact: string;
    school: string;
    degree: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    website: string;
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
  const fieldLabel = "mb-2 block text-sm text-zinc-700";
  const gridLabel = "flex flex-col gap-2";
  const entryCard = "mt-3 grid gap-3 rounded-[22px] border border-line bg-[#fafaf8] p-4 md:grid-cols-2";

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <label className={gridLabel}>
          <span className={fieldLabel}>{texts.personalInfo} - {texts.name}</span>
          <input className="field-base" value={cv.name} onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className={gridLabel}>
          <span className={fieldLabel}>{texts.personalInfo} - {texts.email}</span>
          <input className="field-base" value={cv.email} onChange={(event) => onChange((current) => ({ ...current, email: event.target.value }))} />
        </label>
        <label className={gridLabel}>
          <span className={fieldLabel}>{texts.personalInfo} - {texts.phone}</span>
          <input className="field-base" value={cv.phone} onChange={(event) => onChange((current) => ({ ...current, phone: event.target.value }))} />
        </label>
        <label className={gridLabel}>
          <span className={fieldLabel}>{texts.personalInfo} - {texts.city}</span>
          <input className="field-base" value={cv.location} onChange={(event) => onChange((current) => ({ ...current, location: event.target.value }))} />
        </label>
        <label className={`${gridLabel} md:col-span-2`}>
          <span className={fieldLabel}>{texts.personalInfo} - {texts.website}</span>
          <input className="field-base" value={cv.website} onChange={(event) => onChange((current) => ({ ...current, website: event.target.value }))} />
        </label>
        <label className={`${gridLabel} md:col-span-2`}>
          <span className={fieldLabel}>{texts.personalInfo} - Titre</span>
          <input className="field-base" value={cv.title[locale]} onChange={(event) => onUpdateLocalizedField("title", event.target.value)} />
        </label>
        <label className={`${gridLabel} md:col-span-2`}>
          <span className={fieldLabel}>{texts.summary}</span>
          <textarea className="field-base min-h-28" rows={4} value={cv.summary[locale]} onChange={(event) => onUpdateLocalizedField("summary", event.target.value)} />
        </label>
        <label className={`${gridLabel} md:col-span-2`}>
          <span className={fieldLabel}>{texts.skills}</span>
          <textarea className="field-base min-h-24" rows={3} value={skillText} onChange={(event) => onSkillsChange(event.target.value)} />
        </label>
      </div>

      <section className="mt-7">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium">{texts.experience}</h3>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
            type="button"
            onClick={onAddExperience}
          >
            {texts.addExperience}
          </button>
        </div>
        {cv.experience.map((item) => (
          <article className={entryCard} key={item.id}>
            <label className={gridLabel}>
              <span className={fieldLabel}>{texts.company}</span>
              <input
                className="field-base"
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
            <label className={gridLabel}>
              <span className={fieldLabel}>{texts.period}</span>
              <input
                className="field-base"
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
            <label className={`${gridLabel} md:col-span-2`}>
              <span className={fieldLabel}>{texts.role} ({localeLabels[locale]})</span>
              <input
                className="field-base"
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
            <label className={`${gridLabel} md:col-span-2`}>
              <span className={fieldLabel}>{texts.impact} ({localeLabels[locale]})</span>
              <textarea
                className="field-base min-h-24"
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

      <section className="mt-7">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium">{texts.education}</h3>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
            type="button"
            onClick={onAddEducation}
          >
            {texts.addEducation}
          </button>
        </div>
        {cv.education.map((item) => (
          <article className={entryCard} key={item.id}>
            <label className={gridLabel}>
              <span className={fieldLabel}>{texts.school}</span>
              <input
                className="field-base"
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
            <label className={gridLabel}>
              <span className={fieldLabel}>{texts.period}</span>
              <input
                className="field-base"
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
            <label className={`${gridLabel} md:col-span-2`}>
              <span className={fieldLabel}>{texts.degree} ({localeLabels[locale]})</span>
              <input
                className="field-base"
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
