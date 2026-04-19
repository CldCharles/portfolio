import { useTranslation } from "react-i18next";
import { Planner } from "../features/roadmap/Planner";

export function PlannerPage() {
  const { t } = useTranslation();

  return (
    <main className="pb-10">
      <section className="px-1 py-7">
        <p className="section-kicker">{t("plannerPage.kicker")}</p>
        <h1 className="max-w-[12ch] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em]">
          {t("plannerPage.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-muted">{t("plannerPage.text")}</p>
      </section>

      <Planner />
    </main>
  );
}
