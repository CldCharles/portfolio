import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeLabels } from "../../cv/constants";
import type { Locale, ReleaseEntry } from "../../../types";

type PlannerReleaseEditorProps = {
  locale: Locale;
  release: ReleaseEntry;
  onDelete: () => void;
  onUpdateDate: (value: string) => void;
  onUpdateTitle: (value: string) => void;
  onUpdateNotes: (value: string) => void;
};

export function PlannerReleaseEditor({
  locale,
  release,
  onDelete,
  onUpdateDate,
  onUpdateNotes,
  onUpdateTitle,
}: PlannerReleaseEditorProps) {
  const { t } = useTranslation();
  const releaseTitle = release.title[locale] || release.title.fr || t("planner.untitledRelease");

  return (
    <article className="rounded-[24px] border border-line bg-[color:var(--color-mist)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{release.date}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-zinc-900">{releaseTitle}</h3>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm text-zinc-700 transition hover:-translate-y-0.5"
          onClick={onDelete}
          type="button"
        >
          <Trash2 size={15} />
          {t("planner.deleteRelease")}
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-700">{t("planner.releaseDate")}</span>
          <input className="field-base" type="date" value={release.date} onChange={(event) => onUpdateDate(event.target.value)} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-700">
            {t("planner.releaseTitle")} ({localeLabels[locale]})
          </span>
          <input className="field-base" value={release.title[locale]} onChange={(event) => onUpdateTitle(event.target.value)} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-700">
            {t("planner.releaseNotes")} ({localeLabels[locale]})
          </span>
          <textarea
            className="field-base min-h-28"
            rows={4}
            value={release.notes[locale]}
            onChange={(event) => onUpdateNotes(event.target.value)}
          />
        </label>
      </div>
    </article>
  );
}
