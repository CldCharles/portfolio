export type Locale = "fr" | "en" | "ko";

export type LocalizedText = Record<Locale, string>;

export type ExperienceItem = {
  id: string;
  company: string;
  role: LocalizedText;
  period: string;
  achievements: LocalizedText;
};

export type EducationItem = {
  id: string;
  school: string;
  degree: LocalizedText;
  period: string;
};

export type CVData = {
  name: string;
  title: LocalizedText;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: LocalizedText;
  skills: Record<Locale, string[]>;
  experience: ExperienceItem[];
  education: EducationItem[];
};
