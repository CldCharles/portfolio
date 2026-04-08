import { initialCv } from "../../data/initialCv";
import type { CVData, EducationItem, ExperienceItem, LocalizedText } from "../../types";
import { STORAGE_KEY } from "./constants";

export function createEmptyLocalizedText(): LocalizedText {
  return { fr: "", en: "", es: "" };
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
    return JSON.parse(raw) as CVData;
  } catch {
    return initialCv;
  }
}
