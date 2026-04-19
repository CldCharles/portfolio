import { useTranslation } from "react-i18next";
import type { Locale, RoadmapFeature, TaskStatus } from "../../../types";
import { computeFeatureProgress } from "../utils";

type RoadmapFeatureCardProps = {
  feature: RoadmapFeature;
  locale: Locale;
};

function getFeatureStatusClasses(status: RoadmapFeature["status"]) {
  if (status === "done") {
    return "bg-black text-white";
  }

  if (status === "in_progress") {
    return "border border-[color:var(--color-bronze)] bg-[rgba(200,155,121,0.16)] text-[color:var(--color-bronze)]";
  }

  if (status === "paused") {
    return "border border-line bg-white text-zinc-600";
  }

  return "bg-zinc-100 text-zinc-700";
}

function getTaskStatusClasses(status: TaskStatus) {
  if (status === "done") {
    return "bg-black text-white";
  }

  if (status === "doing") {
    return "border border-[color:var(--color-bronze)] bg-[rgba(200,155,121,0.16)] text-[color:var(--color-bronze)]";
  }

  return "bg-zinc-100 text-zinc-700";
}

export function RoadmapFeatureCard({ feature, locale }: RoadmapFeatureCardProps) {
  const { t } = useTranslation();
  const progress = computeFeatureProgress(feature);
  const title = feature.title[locale] || feature.title.fr || t("roadmap.untitledFeature");
  const summary = feature.summary[locale] || feature.summary.fr;

  return (
    <article className="rounded-[26px] border border-line bg-white/78 p-5 shadow-[0_14px_36px_rgba(21,21,21,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="editorial-title text-[1.7rem] leading-tight tracking-[-0.04em] text-zinc-900">
            {title}
          </h3>
          {summary ? <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-700">{summary}</p> : null}
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.12em]",
            getFeatureStatusClasses(feature.status),
          ].join(" ")}
        >
          {t(`roadmap.featureStatus.${feature.status}`)}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-zinc-700">
          <span>{t("roadmap.progress")}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-[color:var(--color-bronze)] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{t("roadmap.tasks")}</p>
        {feature.tasks.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {feature.tasks.map((task) => (
              <li
                className="flex flex-wrap items-start justify-between gap-3 rounded-[18px] border border-line bg-[color:var(--color-mist)] px-4 py-3"
                key={task.id}
              >
                <span className="text-sm leading-6 text-zinc-800">
                  {task.title[locale] || task.title.fr || t("roadmap.untitledTask")}
                </span>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.12em]",
                    getTaskStatusClasses(task.status),
                  ].join(" ")}
                >
                  {t(`roadmap.taskStatus.${task.status}`)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">{t("roadmap.noTasks")}</p>
        )}
      </div>
    </article>
  );
}
