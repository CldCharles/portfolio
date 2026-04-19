import type { FeatureStatus, TaskStatus } from "../../types";

export const ROADMAP_STORAGE_KEY = "portfolio-roadmap-planner-draft";
export const ROADMAP_UPDATED_EVENT = "roadmap-updated";

export const featureStatuses: FeatureStatus[] = ["in_progress", "planned", "paused", "done"];
export const taskStatuses: TaskStatus[] = ["todo", "doing", "done"];
