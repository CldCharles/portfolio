import { FileJson, Globe2, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { initialRoadmap } from "../../data/initialRoadmap";
import { localeLabels, locales } from "../cv/constants";
import type { Locale, RoadmapFeature, RoadmapTask, ReleaseEntry } from "../../types";
import { toLocale } from "../../i18n";
import { featureStatuses } from "./constants";
import { PlannerFeatureEditor } from "./components/PlannerFeatureEditor";
import { PlannerReleaseEditor } from "./components/PlannerReleaseEditor";
import {
  createReleaseEntry,
  createRoadmapFeature,
  createRoadmapTask,
  loadRoadmap,
  parseRoadmapImport,
  resetRoadmapDraft,
  saveRoadmapDraft,
} from "./utils";

function updateFeature(
  features: RoadmapFeature[],
  featureId: string,
  updater: (feature: RoadmapFeature) => RoadmapFeature,
) {
  return features.map((feature) => (feature.id === featureId ? updater(feature) : feature));
}

function updateTask(
  tasks: RoadmapTask[],
  taskId: string,
  updater: (task: RoadmapTask) => RoadmapTask,
) {
  return tasks.map((task) => (task.id === taskId ? updater(task) : task));
}

export function Planner() {
  const { i18n, t } = useTranslation();
  const currentLanguage = toLocale(i18n.resolvedLanguage ?? i18n.language);
  const [locale, setLocale] = useState<Locale>(currentLanguage);
  const [roadmap, setRoadmap] = useState(() => loadRoadmap());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const skipSaveRef = useRef(true);

  useEffect(() => {
    setLocale(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    saveRoadmapDraft(roadmap);
  }, [roadmap]);

  const groupedFeatures = useMemo(
    () =>
      featureStatuses.map((status) => ({
        status,
        items: roadmap.features.filter((feature) => feature.status === status),
      })),
    [roadmap.features],
  );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "roadmap-planner.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseRoadmapImport(String(reader.result));
        setRoadmap(parsed);
      } catch {
        window.alert(t("planner.invalidJson"));
      }
    };
    reader.readAsText(file);
  };

  const resetDraft = () => {
    skipSaveRef.current = true;
    resetRoadmapDraft();
    setRoadmap(initialRoadmap);
  };

  return (
    <section className="surface-card rounded-[28px] px-5 py-6 sm:px-7">
      <div className="mb-6 rounded-[24px] border border-[color:var(--color-bronze)] bg-[linear-gradient(180deg,rgba(200,155,121,0.14),rgba(255,255,255,0.88))] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-[clamp(1.7rem,3vw,2.6rem)] leading-tight tracking-[-0.05em] text-zinc-900">
              {t("planner.draftTitle")}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">{t("planner.draftText")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm text-zinc-700">
            <Globe2 size={16} />
            <span>{t("planner.editingLanguage")}</span>
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

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
            onClick={exportJson}
            type="button"
          >
            <FileJson size={16} />
            {t("planner.exportJson")}
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <FileJson size={16} />
            {t("planner.importJson")}
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2.5 text-sm transition hover:-translate-y-0.5"
            onClick={resetDraft}
            type="button"
          >
            <RotateCcw size={16} />
            {t("planner.resetDraft")}
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
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <section className="rounded-[24px] border border-line bg-white/80 p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-kicker !mb-2">{t("planner.featuresKicker")}</p>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-zinc-900">
                {t("planner.featuresTitle")}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">{t("planner.featuresText")}</p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm text-white transition hover:-translate-y-0.5"
              onClick={() =>
                setRoadmap((current) => ({
                  ...current,
                  features: [createRoadmapFeature(), ...current.features],
                }))
              }
              type="button"
            >
              <Plus size={16} />
              {t("planner.addFeature")}
            </button>
          </div>

          <div className="space-y-6">
            {groupedFeatures.map((group) => (
              <section key={group.status}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    {t(`roadmap.featureStatus.${group.status}`)}
                  </h4>
                  <span className="text-sm text-zinc-500">{group.items.length}</span>
                </div>

                {group.items.length > 0 ? (
                  <div className="space-y-4">
                    {group.items.map((feature) => (
                      <PlannerFeatureEditor
                        feature={feature}
                        key={feature.id}
                        locale={locale}
                        onAddTask={() =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              tasks: [...entry.tasks, createRoadmapTask()],
                            })),
                          }))
                        }
                        onDeleteFeature={() =>
                          setRoadmap((current) => ({
                            ...current,
                            features: current.features.filter((entry) => entry.id !== feature.id),
                          }))
                        }
                        onDeleteTask={(taskId) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              tasks: entry.tasks.filter((task) => task.id !== taskId),
                            })),
                          }))
                        }
                        onUpdateFeatureStatus={(status) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              status,
                            })),
                          }))
                        }
                        onUpdateSummary={(value) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              summary: {
                                ...entry.summary,
                                [locale]: value,
                              },
                            })),
                          }))
                        }
                        onUpdateTaskStatus={(taskId, status) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              tasks: updateTask(entry.tasks, taskId, (task) => ({
                                ...task,
                                status,
                              })),
                            })),
                          }))
                        }
                        onUpdateTaskTitle={(taskId, value) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              tasks: updateTask(entry.tasks, taskId, (task) => ({
                                ...task,
                                title: {
                                  ...task.title,
                                  [locale]: value,
                                },
                              })),
                            })),
                          }))
                        }
                        onUpdateTitle={(value) =>
                          setRoadmap((current) => ({
                            ...current,
                            features: updateFeature(current.features, feature.id, (entry) => ({
                              ...entry,
                              title: {
                                ...entry.title,
                                [locale]: value,
                              },
                            })),
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">{t("planner.noFeaturesForStatus")}</p>
                )}
              </section>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-white/80 p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-kicker !mb-2">{t("planner.releasesKicker")}</p>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-zinc-900">
                {t("planner.releasesTitle")}
              </h3>
              <p className="mt-2 text-sm leading-7 text-zinc-600">{t("planner.releasesText")}</p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm text-white transition hover:-translate-y-0.5"
              onClick={() =>
                setRoadmap((current) => ({
                  ...current,
                  releases: [createReleaseEntry(), ...current.releases],
                }))
              }
              type="button"
            >
              <Plus size={16} />
              {t("planner.addRelease")}
            </button>
          </div>

          {roadmap.releases.length > 0 ? (
            <div className="space-y-4">
              {roadmap.releases.map((release) => (
                <PlannerReleaseEditor
                  key={release.id}
                  locale={locale}
                  release={release}
                  onDelete={() =>
                    setRoadmap((current) => ({
                      ...current,
                      releases: current.releases.filter((entry) => entry.id !== release.id),
                    }))
                  }
                  onUpdateDate={(value) =>
                    setRoadmap((current) => ({
                      ...current,
                      releases: current.releases.map((entry) =>
                        entry.id === release.id ? { ...entry, date: value } : entry,
                      ),
                    }))
                  }
                  onUpdateNotes={(value) =>
                    setRoadmap((current) => ({
                      ...current,
                      releases: current.releases.map((entry) =>
                        entry.id === release.id
                          ? {
                              ...entry,
                              notes: {
                                ...entry.notes,
                                [locale]: value,
                              },
                            }
                          : entry,
                      ),
                    }))
                  }
                  onUpdateTitle={(value) =>
                    setRoadmap((current) => ({
                      ...current,
                      releases: current.releases.map((entry) =>
                        entry.id === release.id
                          ? {
                              ...entry,
                              title: {
                                ...entry.title,
                                [locale]: value,
                              },
                            }
                          : entry,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">{t("planner.noReleases")}</p>
          )}
        </section>
      </div>
    </section>
  );
}
