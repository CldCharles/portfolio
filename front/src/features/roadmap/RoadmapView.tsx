import { Layers3, ListChecks, NotebookPen, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureStatus, Locale } from "../../types";
import { toLocale } from "../../i18n";
import { featureStatuses, ROADMAP_UPDATED_EVENT } from "./constants";
import { RoadmapFeatureCard } from "./components/RoadmapFeatureCard";
import { computeFeatureProgress, hasRoadmapDraft, loadRoadmap } from "./utils";

function getDateLocale(locale: Locale) {
  if (locale === "en") return "en-US";
  if (locale === "ko") return "ko-KR";
  return "fr-FR";
}

function getStatusTone(status: FeatureStatus) {
  if (status === "in_progress") return "text-[color:var(--color-bronze)]";
  if (status === "done") return "text-black";
  if (status === "paused") return "text-zinc-500";
  return "text-zinc-700";
}

export function RoadmapView() {
  const { i18n, t } = useTranslation();
  const locale = toLocale(i18n.resolvedLanguage ?? i18n.language);
  const [roadmap, setRoadmap] = useState(() => loadRoadmap());
  const [draftActive, setDraftActive] = useState(() => hasRoadmapDraft());

  useEffect(() => {
    const sync = () => {
      setRoadmap(loadRoadmap());
      setDraftActive(hasRoadmapDraft());
    };

    window.addEventListener(ROADMAP_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(ROADMAP_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const groupedFeatures = useMemo(
    () =>
      featureStatuses
        .map((status) => ({
          status,
          items: roadmap.features.filter((feature) => feature.status === status),
        }))
        .filter((group) => group.items.length > 0),
    [roadmap.features],
  );

  const sortedReleases = useMemo(
    () => [...roadmap.releases].sort((a, b) => b.date.localeCompare(a.date)),
    [roadmap.releases],
  );

  const statusCounts = useMemo(
    () =>
      featureStatuses.map((status) => ({
        status,
        count: roadmap.features.filter((feature) => feature.status === status).length,
      })),
    [roadmap.features],
  );

  const averageProgress = useMemo(() => {
    if (roadmap.features.length === 0) {
      return 0;
    }

    const total = roadmap.features.reduce((sum, feature) => sum + computeFeatureProgress(feature), 0);
    return Math.round(total / roadmap.features.length);
  }, [roadmap.features]);

  return (
    <div className="grid gap-7">
      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div>
            <p className="section-kicker">{t("roadmap.introKicker")}</p>
            <h2 className="editorial-title max-w-[14ch] text-[clamp(2rem,4vw,3.5rem)] leading-[0.96] tracking-[-0.05em]">
              {t("roadmap.introTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700">{t("roadmap.introText")}</p>
            {draftActive ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-bronze)] bg-[rgba(200,155,121,0.12)] px-4 py-2 text-sm text-[color:var(--color-bronze)]">
                <NotebookPen size={15} />
                {t("roadmap.draftNotice")}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statusCounts.map((item) => (
              <div className="rounded-[22px] border border-line bg-[color:var(--color-mist)] p-5" key={item.status}>
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                  {t(`roadmap.featureStatus.${item.status}`)}
                </p>
                <p className={["mt-3 text-3xl font-semibold tracking-[-0.05em]", getStatusTone(item.status)].join(" ")}>
                  {item.count}
                </p>
              </div>
            ))}
            <div className="rounded-[22px] border border-line bg-white p-5 sm:col-span-2">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{t("roadmap.averageProgress")}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-900">{averageProgress}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <Layers3 size={18} />
          </div>
          <div>
            <p className="section-kicker !mb-1">{t("roadmap.sectionRoadmapKicker")}</p>
            <h2 className="editorial-title text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.04em]">
              {t("roadmap.sectionRoadmapTitle")}
            </h2>
          </div>
        </div>

        {groupedFeatures.length > 0 ? (
          <div className="space-y-8">
            {groupedFeatures.map((group) => (
              <section key={group.status}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    {t(`roadmap.featureStatus.${group.status}`)}
                  </h3>
                  <span className="text-sm text-zinc-500">{group.items.length}</span>
                </div>
                <div className="grid gap-4">
                  {group.items.map((feature) => (
                    <RoadmapFeatureCard feature={feature} key={feature.id} locale={locale} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t("roadmap.noFeatures")}</p>
        )}
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <ListChecks size={18} />
          </div>
          <div>
            <p className="section-kicker !mb-1">{t("roadmap.sectionChangelogKicker")}</p>
            <h2 className="editorial-title text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.04em]">
              {t("roadmap.sectionChangelogTitle")}
            </h2>
          </div>
        </div>

        {sortedReleases.length > 0 ? (
          <div className="space-y-5">
            {sortedReleases.map((release) => (
              <article
                className="grid gap-4 border-t border-line py-5 first:border-t-0 first:pt-0 md:grid-cols-[180px_minmax(0,1fr)]"
                key={release.id}
              >
                <div className="flex items-start gap-3 text-sm text-zinc-500">
                  <Sparkles className="mt-1 shrink-0" size={15} />
                  <span>
                    {new Intl.DateTimeFormat(getDateLocale(locale), { dateStyle: "long" }).format(
                      new Date(release.date),
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="editorial-title text-[1.55rem] leading-tight tracking-[-0.04em] text-zinc-900">
                    {release.title[locale] || release.title.fr || t("planner.untitledRelease")}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">
                    {release.notes[locale] || release.notes.fr}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">{t("roadmap.noReleases")}</p>
        )}
      </section>
    </div>
  );
}
