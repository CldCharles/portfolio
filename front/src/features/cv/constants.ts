import type { Locale } from "../../types";

export const STORAGE_KEY = "portfolio-cv-studio";
export const locales: Locale[] = ["fr", "en", "es"];

export const localeLabels: Record<Locale, string> = {
  fr: "Francais",
  en: "English",
  es: "Espanol",
};

export const cvUiCopy = {
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
    "Export PDF via impression navigateur. Simple, fiable et compatible avec un hebergement statique gratuit.",
  intro:
    "Edite ton CV, gere plusieurs langues et exporte une version PDF propre depuis une page dediee.",
} as const;
