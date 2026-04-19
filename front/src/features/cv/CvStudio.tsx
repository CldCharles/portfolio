import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileJson, Globe2, Languages, RotateCcw, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { initialCv } from "../../data/initialCv";
import type { CVData, Locale } from "../../types";
import { toLocale } from "../../i18n";
import { CvPreview } from "./CvPreview";
import { CvEditor } from "./components/CvEditor";
import { localeLabels, locales } from "./constants";
import { createEducation, createExperience, loadCv, saveCv } from "./utils";

export function CvStudio() {
  const { i18n, t } = useTranslation();
  const currentLanguage = toLocale(i18n.resolvedLanguage ?? i18n.language);
  const [locale, setLocale] = useState<Locale>(currentLanguage);
  const [cv, setCv] = useState<CVData>(() => loadCv());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLElement>(null);

  const skillText = useMemo(() => cv.skills[locale].join(", "), [cv.skills, locale]);

  useEffect(() => {
    saveCv(cv);
  }, [cv]);

  useEffect(() => {
    setLocale(currentLanguage);
  }, [currentLanguage]);

  const updateLocalizedField = (key: "title" | "summary", value: string) => {
    setCv((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [locale]: value,
      },
    }));
  };

  const resetCv = () => {
    setCv(initialCv);
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
      } catch {
        window.alert(t("cvStudio.invalidJson"));
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
    <section className="surface-card rounded-[28px] px-5 py-6 sm:px-7">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] leading-[1.02] tracking-[-0.05em]">
            {t("cvStudio.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-muted">{t("cvStudio.intro")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-zinc-700">
          <Globe2 size={16} />
          <span>{t("cvStudio.language")}</span>
          {locales.map((item) => (
            <button
              key={item}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition hover:-translate-y-0.5",
                item === locale
                  ? "border-black bg-black text-white"
                  : "border-line bg-white text-ink",
              ].join(" ")}
              onClick={() => setLocale(item)}
              type="button"
            >
              {localeLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.82fr)]">
        <section className="rounded-[24px] border border-line bg-white/80 p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex flex-wrap gap-2.5 print-hidden">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
              type="button"
              onClick={copyFrenchToLocale}
            >
              <Languages size={16} />
              {t("cvStudio.duplicate")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
              type="button"
              onClick={() => saveCv(cv)}
            >
              <Save size={16} />
              {t("cvStudio.save")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
              type="button"
              onClick={resetCv}
            >
              <RotateCcw size={16} />
              {t("cvStudio.reset")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
              type="button"
              onClick={exportJson}
            >
              <FileJson size={16} />
              {t("cvStudio.exportJson")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileJson size={16} />
              {t("cvStudio.importJson")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-2.5 text-sm text-white transition hover:-translate-y-0.5"
              type="button"
              onClick={exportPdf}
            >
              <Download size={16} />
              {t("cvStudio.exportPdf")}
            </button>
            <input
              ref={fileInputRef}
              accept="application/json"
              className="hidden"
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
            texts={{
              personalInfo: t("cvStudio.personalInfo"),
              summary: t("cvStudio.summary"),
              skills: t("cvStudio.skills"),
              experience: t("cvStudio.experience"),
              education: t("cvStudio.education"),
              addExperience: t("cvStudio.addExperience"),
              addEducation: t("cvStudio.addEducation"),
              company: t("cvStudio.company"),
              period: t("cvStudio.period"),
              role: t("cvStudio.role"),
              impact: t("cvStudio.impact"),
              school: t("cvStudio.school"),
              degree: t("cvStudio.degree"),
              name: t("cvStudio.name"),
              email: t("cvStudio.email"),
              phone: t("cvStudio.phone"),
              city: t("cvStudio.city"),
              website: t("cvStudio.website"),
            }}
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

        <CvPreview
          cv={cv}
          locale={locale}
          previewRef={previewRef}
          texts={{
            printNote: t("cvStudio.printNote"),
            summary: t("cvStudio.summary"),
            skills: t("cvStudio.skills"),
            experience: t("cvStudio.experience"),
            education: t("cvStudio.education"),
          }}
        />
      </div>
    </section>
  );
}
