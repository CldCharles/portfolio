export type Locale = "fr" | "en" | "ko";

export type LocalizedText = Record<Locale, string>;

export type FeatureStatus = "planned" | "in_progress" | "done" | "paused";

export type TaskStatus = "todo" | "doing" | "done";

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

export type RoadmapTask = {
  id: string;
  title: LocalizedText;
  status: TaskStatus;
};

export type RoadmapFeature = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  status: FeatureStatus;
  tasks: RoadmapTask[];
};

export type ReleaseEntry = {
  id: string;
  date: string;
  title: LocalizedText;
  notes: LocalizedText;
};

export type RoadmapData = {
  features: RoadmapFeature[];
  releases: ReleaseEntry[];
};
