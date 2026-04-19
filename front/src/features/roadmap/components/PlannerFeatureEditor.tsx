import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeLabels } from "../../cv/constants";
import type { Locale, RoadmapFeature, TaskStatus } from "../../../types";
import { taskStatuses } from "../constants";

type PlannerFeatureEditorProps = {
  feature: RoadmapFeature;
  locale: Locale;
  onAddTask: () => void;
  onDeleteFeature: () => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateFeatureStatus: (status: RoadmapFeature["status"]) => void;
  onUpdateTitle: (value: string) => void;
  onUpdateSummary: (value: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTaskTitle: (taskId: string, value: string) => void;
};

export function PlannerFeatureEditor({
  feature,
  locale,
  onAddTask,
  onDeleteFeature,
  onDeleteTask,
  onUpdateFeatureStatus,
  onUpdateSummary,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  onUpdateTitle,
}: PlannerFeatureEditorProps) {
  const { t } = useTranslation();
  const cardTitle = feature.title[locale] || feature.title.fr || t("planner.untitledFeature");

  return (
    <article className="rounded-[24px] border border-line bg-[color:var(--color-mist)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {t(`roadmap.featureStatus.${feature.status}`)}
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-zinc-900">{cardTitle}</h3>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm text-zinc-700 transition hover:-translate-y-0.5"
          onClick={onDeleteFeature}
          type="button"
        >
          <Trash2 size={15} />
          {t("planner.deleteFeature")}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm text-zinc-700">
            {t("planner.featureTitle")} ({localeLabels[locale]})
          </span>
          <input
            className="field-base"
            value={feature.title[locale]}
            onChange={(event) => onUpdateTitle(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-700">{t("planner.featureStatus")}</span>
          <select
            className="field-base"
            value={feature.status}
            onChange={(event) => onUpdateFeatureStatus(event.target.value as RoadmapFeature["status"])}
          >
            <option value="planned">{t("roadmap.featureStatus.planned")}</option>
            <option value="in_progress">{t("roadmap.featureStatus.in_progress")}</option>
            <option value="paused">{t("roadmap.featureStatus.paused")}</option>
            <option value="done">{t("roadmap.featureStatus.done")}</option>
          </select>
        </label>

        <div className="rounded-[18px] border border-line bg-white px-4 py-3 text-sm text-zinc-600">
          {t("planner.taskCount", { count: feature.tasks.length })}
        </div>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm text-zinc-700">
            {t("planner.featureSummary")} ({localeLabels[locale]})
          </span>
          <textarea
            className="field-base min-h-28"
            rows={4}
            value={feature.summary[locale]}
            onChange={(event) => onUpdateSummary(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
            {t("planner.tasks")}
          </h4>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3.5 py-2 text-sm text-zinc-700 transition hover:-translate-y-0.5"
            onClick={onAddTask}
            type="button"
          >
            <Plus size={15} />
            {t("planner.addTask")}
          </button>
        </div>

        {feature.tasks.length > 0 ? (
          <div className="space-y-3">
            {feature.tasks.map((task) => (
              <div className="grid gap-3 rounded-[20px] border border-line bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]" key={task.id}>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-zinc-700">
                    {t("planner.taskTitle")} ({localeLabels[locale]})
                  </span>
                  <input
                    className="field-base"
                    value={task.title[locale]}
                    onChange={(event) => onUpdateTaskTitle(task.id, event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-zinc-700">{t("planner.taskStatus")}</span>
                  <select
                    className="field-base"
                    value={task.status}
                    onChange={(event) => onUpdateTaskStatus(task.id, event.target.value as TaskStatus)}
                  >
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`roadmap.taskStatus.${status}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm text-zinc-700 transition hover:-translate-y-0.5"
                    onClick={() => onDeleteTask(task.id)}
                    type="button"
                  >
                    <Trash2 size={15} />
                    {t("planner.deleteTask")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t("planner.noTasks")}</p>
        )}
      </div>
    </article>
  );
}
