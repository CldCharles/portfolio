import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileJson,
  Globe2,
  Languages,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { initialCv } from "./data/initialCv";
import type {
  CVData,
  EducationItem,
  ExperienceItem,
  Locale,
  LocalizedText,
} from "./types";

const STORAGE_KEY = "portfolio-cv-studio";
const locales: Locale[] = ["fr", "en", "es"];

const localeLabels: Record<Locale, string> = {
  fr: "Francais",
  en: "English",
  es: "Espanol",
};

const uiCopy = {
  fr: {
    heroEyebrow: "Portfolio personnel",
    heroTitle: "Un portfolio moderne avec un vrai CV Studio au coeur du produit.",
    heroText:
      "Cette premiere version mise sur un front React autonome, hebergeable gratuitement, avec edition locale, variantes multilingues et export PDF sans backend obligatoire.",
    sectionEditor: "Editeur de CV",
    sectionPreview: "Apercu PDF",
    description:
      "Edite ton CV, declenche des variantes par langue, sauvegarde en local et genere une version propre pour l'impression ou l'export PDF.",
    language: "Langue active",
    personalInfo: "Informations personnelles",
    summary: "Accroche",
    skills: "Competences",
    experience: "Experience",
    education: "Formation",
    duplicate: "Dupliquer le contenu FR",
    save: "Sauvegarder",
    reset: "Reinitialiser",
    exportJson: "Exporter JSON",
    importJson: "Importer JSON",
    exportPdf: "Exporter PDF",
    addExperience: "Ajouter une experience",
    addEducation: "Ajouter une formation",
    printNote:
      "L'export PDF utilise la feuille d'impression du navigateur. Sur Vercel ou Netlify, cette approche reste gratuite et sans serveur.",
  },
};

function createEmptyLocalizedText(): LocalizedText {
  return { fr: "", en: "", es: "" };
}

function createExperience(): ExperienceItem {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: createEmptyLocalizedText(),
    period: "",
    achievements: createEmptyLocalizedText(),
  };
}

function createEducation(): EducationItem {
  return {
    id: crypto.randomUUID(),
    school: "",
    degree: createEmptyLocalizedText(),
    period: "",
  };
}

function loadCv(): CVData {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialCv;

  try {
    return JSON.parse(raw) as CVData;
  } catch {
    return initialCv;
  }
}

function App() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [cv, setCv] = useState<CVData>(() => loadCv());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  const t = uiCopy.fr;

  const skillText = useMemo(() => cv.skills[locale].join(", "), [cv.skills, locale]);

  const updateLocalizedField = (
    key: "title" | "summary",
    value: string,
    targetLocale = locale,
  ) => {
    setCv((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [targetLocale]: value,
      },
    }));
  };

  const saveCv = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
  };

  const resetCv = () => {
    setCv(initialCv);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCv));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cv-${locale}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as CVData;
        setCv(parsed);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        window.alert("Le fichier JSON n'est pas valide.");
      }
    };
    reader.readAsText(file);
  };

  const exportPdf = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.print();
  };

  const copyFrenchToLocale = () => {
    if (locale === "fr") return;
    setCv((current) => ({
      ...current,
      title: { ...current.title, [locale]: current.title.fr },
      summary: { ...current.summary, [locale]: current.summary.fr },
      skills: { ...current.skills, [locale]: [...current.skills.fr] },
      experience: current.experience.map((item) => ({
        ...item,
        role: { ...item.role, [locale]: item.role.fr },
        achievements: { ...item.achievements, [locale]: item.achievements.fr },
      })),
      education: current.education.map((item) => ({
        ...item,
        degree: { ...item.degree, [locale]: item.degree.fr },
      })),
    }));
  };

  return (
    <div className="app-shell">
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} />
            {t.heroEyebrow}
          </span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
          <div className="hero-badges">
            <span>React + TypeScript</span>
            <span>Local-first</span>
            <span>PDF export</span>
            <span>Hosting gratuit</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-header">
            <Languages size={18} />
            <span>CV Studio</span>
          </div>
          <div className="metric-grid">
            <div>
              <strong>3</strong>
              <span>Langues</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Client-side</span>
            </div>
            <div>
              <strong>A4</strong>
              <span>Print-ready</span>
            </div>
            <div>
              <strong>0 EUR</strong>
              <span>Backend requis</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="workspace">
        <section className="panel editor-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t.sectionEditor}</p>
              <h2>{t.description}</h2>
            </div>
            <div className="locale-switcher">
              <Globe2 size={16} />
              <span>{t.language}</span>
              {locales.map((item) => (
                <button
                  key={item}
                  className={item === locale ? "chip active" : "chip"}
                  onClick={() => setLocale(item)}
                  type="button"
                >
                  {localeLabels[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar">
            <button className="action" type="button" onClick={copyFrenchToLocale}>
              <Languages size={16} />
              {t.duplicate}
            </button>
            <button className="action" type="button" onClick={saveCv}>
              <Save size={16} />
              {t.save}
            </button>
            <button className="action ghost" type="button" onClick={resetCv}>
              <RotateCcw size={16} />
              {t.reset}
            </button>
            <button className="action ghost" type="button" onClick={exportJson}>
              <FileJson size={16} />
              {t.exportJson}
            </button>
            <button
              className="action ghost"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileJson size={16} />
              {t.importJson}
            </button>
            <button className="action primary" type="button" onClick={exportPdf}>
              <Download size={16} />
              {t.exportPdf}
            </button>
            <input
              ref={fileInputRef}
              accept="application/json"
              className="hidden-input"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importJson(file);
              }}
              type="file"
            />
          </div>

          <div className="form-grid">
            <label>
              <span>{t.personalInfo} - Nom</span>
              <input
                value={cv.name}
                onChange={(event) => setCv((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              <span>{t.personalInfo} - Email</span>
              <input
                value={cv.email}
                onChange={(event) => setCv((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              <span>{t.personalInfo} - Telephone</span>
              <input
                value={cv.phone}
                onChange={(event) => setCv((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              <span>{t.personalInfo} - Ville</span>
              <input
                value={cv.location}
                onChange={(event) =>
                  setCv((current) => ({ ...current, location: event.target.value }))
                }
              />
            </label>
            <label className="full-width">
              <span>{t.personalInfo} - Site web</span>
              <input
                value={cv.website}
                onChange={(event) =>
                  setCv((current) => ({ ...current, website: event.target.value }))
                }
              />
            </label>
            <label className="full-width">
              <span>{t.personalInfo} - Titre</span>
              <input
                value={cv.title[locale]}
                onChange={(event) => updateLocalizedField("title", event.target.value)}
              />
            </label>
            <label className="full-width">
              <span>{t.summary}</span>
              <textarea
                rows={4}
                value={cv.summary[locale]}
                onChange={(event) => updateLocalizedField("summary", event.target.value)}
              />
            </label>
            <label className="full-width">
              <span>{t.skills}</span>
              <textarea
                rows={3}
                value={skillText}
                onChange={(event) =>
                  setCv((current) => ({
                    ...current,
                    skills: {
                      ...current.skills,
                      [locale]: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </label>
          </div>

          <section className="editor-subsection">
            <div className="subsection-title-row">
              <h3>{t.experience}</h3>
              <button
                className="inline-action"
                type="button"
                onClick={() =>
                  setCv((current) => ({
                    ...current,
                    experience: [...current.experience, createExperience()],
                  }))
                }
              >
                <Plus size={16} />
                {t.addExperience}
              </button>
            </div>
            {cv.experience.map((item) => (
              <article className="entry-card" key={item.id}>
                <label>
                  <span>Entreprise</span>
                  <input
                    value={item.company}
                    onChange={(event) =>
                      setCv((current) => ({
                        ...current,
                        experience: current.experience.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, company: event.target.value }
                            : entry,
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
                      setCv((current) => ({
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
                      setCv((current) => ({
                        ...current,
                        experience: current.experience.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                role: { ...entry.role, [locale]: event.target.value },
                              }
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
                      setCv((current) => ({
                        ...current,
                        experience: current.experience.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                achievements: {
                                  ...entry.achievements,
                                  [locale]: event.target.value,
                                },
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
              <h3>{t.education}</h3>
              <button
                className="inline-action"
                type="button"
                onClick={() =>
                  setCv((current) => ({
                    ...current,
                    education: [...current.education, createEducation()],
                  }))
                }
              >
                <Plus size={16} />
                {t.addEducation}
              </button>
            </div>
            {cv.education.map((item) => (
              <article className="entry-card" key={item.id}>
                <label>
                  <span>Ecole</span>
                  <input
                    value={item.school}
                    onChange={(event) =>
                      setCv((current) => ({
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
                      setCv((current) => ({
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
                      setCv((current) => ({
                        ...current,
                        education: current.education.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                degree: { ...entry.degree, [locale]: event.target.value },
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
        </section>

        <aside className="panel preview-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t.sectionPreview}</p>
              <h2>{t.printNote}</h2>
            </div>
          </div>

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

            <section className="cv-section">
              <h3>{t.summary}</h3>
              <p>{cv.summary[locale]}</p>
            </section>

            <section className="cv-section">
              <h3>{t.skills}</h3>
              <ul className="tag-list">
                {cv.skills[locale].map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>

            <section className="cv-section">
              <h3>{t.experience}</h3>
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

            <section className="cv-section">
              <h3>{t.education}</h3>
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
      </main>
    </div>
  );
}

export default App;
