import { useMemo, useRef, useState } from "react";
import { Download, FileJson, Globe2, Languages, Plus, RotateCcw, Save } from "lucide-react";
import { initialCv } from "../../data/initialCv";
import type { CVData, Locale } from "../../types";
import { CvPreview } from "./CvPreview";
import { CvEditor } from "./components/CvEditor";
import { cvUiCopy, localeLabels, locales } from "./constants";
import { createEducation, createExperience, loadCv } from "./utils";

export function CvStudio() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [cv, setCv] = useState<CVData>(() => loadCv());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLElement>(null);

  const skillText = useMemo(() => cv.skills[locale].join(", "), [cv.skills, locale]);

  const updateLocalizedField = (key: "title" | "summary", value: string) => {
    setCv((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [locale]: value,
      },
    }));
  };

  const saveCv = () => {
    window.localStorage.setItem("portfolio-cv-studio", JSON.stringify(cv));
  };

  const resetCv = () => {
    setCv(initialCv);
    window.localStorage.setItem("portfolio-cv-studio", JSON.stringify(initialCv));
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
        window.localStorage.setItem("portfolio-cv-studio", JSON.stringify(parsed));
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
    <section className="content-section cv-section-shell">
      <div className="section-heading">
        <div>
          <h2>Edition locale, variantes multilingues et export propre.</h2>
          <p>{cvUiCopy.intro}</p>
        </div>
        <div className="locale-switcher">
          <Globe2 size={16} />
          <span>{cvUiCopy.language}</span>
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

      <div className="cv-workspace">
        <section className="editor-panel">
          <div className="toolbar">
            <button className="action" type="button" onClick={copyFrenchToLocale}>
              <Languages size={16} />
              {cvUiCopy.duplicate}
            </button>
            <button className="action" type="button" onClick={saveCv}>
              <Save size={16} />
              {cvUiCopy.save}
            </button>
            <button className="action ghost" type="button" onClick={resetCv}>
              <RotateCcw size={16} />
              {cvUiCopy.reset}
            </button>
            <button className="action ghost" type="button" onClick={exportJson}>
              <FileJson size={16} />
              {cvUiCopy.exportJson}
            </button>
            <button
              className="action ghost"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileJson size={16} />
              {cvUiCopy.importJson}
            </button>
            <button className="action primary" type="button" onClick={exportPdf}>
              <Download size={16} />
              {cvUiCopy.exportPdf}
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

          <CvEditor
            cv={cv}
            locale={locale}
            localeLabels={localeLabels}
            skillText={skillText}
            texts={cvUiCopy}
            onAddEducation={() =>
              setCv((current) => ({
                ...current,
                education: [...current.education, createEducation()],
              }))
            }
            onAddExperience={() =>
              setCv((current) => ({
                ...current,
                experience: [...current.experience, createExperience()],
              }))
            }
            onChange={setCv}
            onSkillsChange={(value) =>
              setCv((current) => ({
                ...current,
                skills: {
                  ...current.skills,
                  [locale]: value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                },
              }))
            }
            onUpdateLocalizedField={updateLocalizedField}
          />
        </section>

        <CvPreview cv={cv} locale={locale} previewRef={previewRef} texts={cvUiCopy} />
      </div>
    </section>
  );
}
