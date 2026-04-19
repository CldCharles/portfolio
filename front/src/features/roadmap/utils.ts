import { initialRoadmap } from "../../data/initialRoadmap";
import type {
  FeatureStatus,
  LocalizedText,
  ReleaseEntry,
  RoadmapData,
  RoadmapFeature,
  RoadmapTask,
  TaskStatus,
} from "../../types";
import { ROADMAP_STORAGE_KEY, ROADMAP_UPDATED_EVENT } from "./constants";

export function createEmptyLocalizedText(): LocalizedText {
  return { fr: "", en: "", ko: "" };
}

export function createRoadmapTask(): RoadmapTask {
  return {
    id: crypto.randomUUID(),
    title: createEmptyLocalizedText(),
    status: "todo",
  };
}

export function createRoadmapFeature(): RoadmapFeature {
  return {
    id: crypto.randomUUID(),
    title: createEmptyLocalizedText(),
    summary: createEmptyLocalizedText(),
    status: "planned",
    tasks: [],
  };
}

export function createReleaseEntry(): ReleaseEntry {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: createEmptyLocalizedText(),
    notes: createEmptyLocalizedText(),
  };
}

export function hasRoadmapDraft(): boolean {
  return window.localStorage.getItem(ROADMAP_STORAGE_KEY) !== null;
}

export function loadRoadmap(): RoadmapData {
  const raw = window.localStorage.getItem(ROADMAP_STORAGE_KEY);
  if (!raw) return initialRoadmap;

  try {
    return normalizeRoadmap(JSON.parse(raw) as Partial<RoadmapData>);
  } catch {
    return initialRoadmap;
  }
}

export function saveRoadmapDraft(roadmap: RoadmapData) {
  window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmap));
  window.dispatchEvent(new Event(ROADMAP_UPDATED_EVENT));
}

export function resetRoadmapDraft() {
  window.localStorage.removeItem(ROADMAP_STORAGE_KEY);
  window.dispatchEvent(new Event(ROADMAP_UPDATED_EVENT));
}

export function parseRoadmapImport(raw: string): RoadmapData {
  return normalizeRoadmap(JSON.parse(raw) as Partial<RoadmapData>);
}

export function computeFeatureProgress(feature: RoadmapFeature): number {
  if (feature.status === "done") {
    return 100;
  }

  if (feature.tasks.length === 0) {
    return 0;
  }

  const total = feature.tasks.reduce((sum, task) => sum + getTaskWeight(task.status), 0);
  return Math.round((total / feature.tasks.length) * 100);
}

function getTaskWeight(status: TaskStatus): number {
  if (status === "done") return 1;
  if (status === "doing") return 0.5;
  return 0;
}

function normalizeLocalizedText(text?: Partial<Record<"fr" | "en" | "ko" | "es", string>>): LocalizedText {
  return {
    fr: text?.fr ?? "",
    en: text?.en ?? text?.fr ?? "",
    ko: text?.ko ?? text?.es ?? text?.en ?? text?.fr ?? "",
  };
}

function normalizeFeatureStatus(status?: string): FeatureStatus {
  if (status === "planned" || status === "in_progress" || status === "done" || status === "paused") {
    return status;
  }
  return "planned";
}

function normalizeTaskStatus(status?: string): TaskStatus {
  if (status === "todo" || status === "doing" || status === "done") {
    return status;
  }
  return "todo";
}

function normalizeRoadmap(roadmap?: Partial<RoadmapData>): RoadmapData {
  return {
    features:
      roadmap?.features?.map((feature) => ({
        id: feature.id ?? crypto.randomUUID(),
        title: normalizeLocalizedText(feature.title),
        summary: normalizeLocalizedText(feature.summary),
        status: normalizeFeatureStatus(feature.status),
        tasks:
          feature.tasks?.map((task) => ({
            id: task.id ?? crypto.randomUUID(),
            title: normalizeLocalizedText(task.title),
            status: normalizeTaskStatus(task.status),
          })) ?? [],
      })) ?? initialRoadmap.features,
    releases:
      roadmap?.releases?.map((release) => ({
        id: release.id ?? crypto.randomUUID(),
        date: release.date ?? new Date().toISOString().slice(0, 10),
        title: normalizeLocalizedText(release.title),
        notes: normalizeLocalizedText(release.notes),
      })) ?? initialRoadmap.releases,
  };
}
