import { CvStudio } from "../features/cv/CvStudio";
import { useTranslation } from "react-i18next";

export function CvStudioPage() {
  const { t } = useTranslation();

  return (
    <main className="pb-10">
      <section className="px-1 py-7">
        <p className="section-kicker">{t("cvStudioPage.kicker")}</p>
        <h1 className="max-w-[13ch] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em]">
          {t("cvStudioPage.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-muted">
          {t("cvStudioPage.text")}
        </p>
      </section>

      <CvStudio />
    </main>
  );
}
