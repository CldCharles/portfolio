import { initialCv } from "../../data/initialCv";
import type { CVData, EducationItem, ExperienceItem, LocalizedText, Locale } from "../../types";
import { STORAGE_KEY } from "./constants";

export const CV_UPDATED_EVENT = "cv-updated";

export function createEmptyLocalizedText(): LocalizedText {
  return { fr: "", en: "", ko: "" };
}

export function createExperience(): ExperienceItem {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: createEmptyLocalizedText(),
    period: "",
    achievements: createEmptyLocalizedText(),
  };
}

export function createEducation(): EducationItem {
  return {
    id: crypto.randomUUID(),
    school: "",
    degree: createEmptyLocalizedText(),
    period: "",
  };
}

export function loadCv(): CVData {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialCv;

  try {
    return normalizeCv(JSON.parse(raw) as Partial<CVData>);
  } catch {
    return initialCv;
  }
}

export function saveCv(cv: CVData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
  window.dispatchEvent(new Event(CV_UPDATED_EVENT));
}

function normalizeText(text?: Partial<Record<Locale | "es", string>>): LocalizedText {
  return {
    fr: text?.fr ?? "",
    en: text?.en ?? text?.fr ?? "",
    ko: text?.ko ?? text?.es ?? text?.en ?? text?.fr ?? "",
  };
}

function normalizeSkills(skills?: Partial<Record<Locale | "es", string[]>>) {
  return {
    fr: skills?.fr ?? [],
    en: skills?.en ?? skills?.fr ?? [],
    ko: skills?.ko ?? skills?.es ?? skills?.en ?? skills?.fr ?? [],
  };
}

function normalizeCv(cv?: Partial<CVData>): CVData {
  return {
    name: cv?.name ?? initialCv.name,
    title: normalizeText(cv?.title),
    email: cv?.email ?? initialCv.email,
    phone: cv?.phone ?? initialCv.phone,
    location: cv?.location ?? initialCv.location,
    website: cv?.website ?? initialCv.website,
    summary: normalizeText(cv?.summary),
    skills: normalizeSkills(cv?.skills),
    experience:
      cv?.experience?.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        company: item.company ?? "",
        role: normalizeText(item.role),
        period: item.period ?? "",
        achievements: normalizeText(item.achievements),
      })) ?? initialCv.experience,
    education:
      cv?.education?.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        school: item.school ?? "",
        degree: normalizeText(item.degree),
        period: item.period ?? "",
      })) ?? initialCv.education,
  };
}
