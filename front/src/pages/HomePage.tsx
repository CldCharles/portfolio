import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CV_UPDATED_EVENT, loadCv } from "../features/cv/utils";
import { toLocale } from "../i18n";

export function HomePage() {
  const [cv, setCv] = useState(() => loadCv());
  const { i18n, t } = useTranslation();
  const locale = toLocale(i18n.resolvedLanguage ?? i18n.language);

  useEffect(() => {
    const syncCv = () => setCv(loadCv());

    window.addEventListener(CV_UPDATED_EVENT, syncCv);
    window.addEventListener("storage", syncCv);

    return () => {
      window.removeEventListener(CV_UPDATED_EVENT, syncCv);
      window.removeEventListener("storage", syncCv);
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-7 px-5 pb-16 pt-4 sm:px-8 lg:px-12">
      <section className="surface-card relative overflow-hidden px-7 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-white/80 via-white/20 to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-[rgba(200,155,121,0.22)] blur-3xl" />
        <div className="pointer-events-none absolute left-10 top-14 h-32 w-32 rounded-full bronze-glow blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] xl:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <p className="section-kicker">{t("home.kicker")}</p>
            <h1 className="editorial-title max-w-[11ch] text-[clamp(3.4rem,8vw,7rem)] leading-[0.88] font-medium tracking-[-0.06em] text-ink">
              {cv.name}
            </h1>
            <p className="mt-6 max-w-3xl text-[1.12rem] leading-8 text-[color:var(--color-bronze)]">
              {cv.title[locale]}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-700">
              {t("home.heroManifest")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm text-white transition hover:-translate-y-0.5"
                to="/cv-studio"
              >
                {t("home.openStudio")}
                <ArrowRight size={16} />
              </Link>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm transition hover:-translate-y-0.5"
                href={cv.website}
                rel="noreferrer"
                target="_blank"
              >
                {t("home.openWebsite")}
              </a>
            </div>
          </motion.div>

          <motion.aside
            className="grid gap-4"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.08 }}
          >
            <div className="rounded-[28px] border border-line bg-white/85 p-6 shadow-[var(--shadow-soft)]">
              <p className="section-kicker !mb-4">{t("home.contact")}</p>
              <div className="space-y-3 text-sm text-zinc-700">
                <p className="flex items-center gap-3">
                  <Mail size={15} />
                  <span>{cv.email}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone size={15} />
                  <span>{cv.phone}</span>
                </p>
                <p className="flex items-center gap-3">
                  <MapPin size={15} />
                  <span>{cv.location}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Globe size={15} />
                  <a
                    className="break-all underline decoration-zinc-300 underline-offset-4"
                    href={cv.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {cv.website}
                  </a>
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--color-bronze)] bg-[color:var(--color-ink)] px-6 py-6 text-white">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-white/55">
                {t("home.identity")}
              </p>
              <div className="mt-4 grid gap-4 text-sm">
                <div>
                  <p className="text-white/55">{t("home.roleLabel")}</p>
                  <p className="mt-1 text-white">{cv.title[locale]}</p>
                </div>
                <div>
                  <p className="text-white/55">{t("home.locationLabel")}</p>
                  <p className="mt-1 text-white">{cv.location}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <UserRound size={18} />
          </div>
          <p className="section-kicker !mb-0">{t("home.about")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div>
            <h2 className="editorial-title max-w-[16ch] text-[clamp(2.1rem,4vw,3.8rem)] leading-[0.96] tracking-[-0.05em]">
              {t("home.aboutTitle")}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-700">{cv.summary[locale]}</p>
          </div>

          <div className="rounded-[28px] border border-line bg-zinc-50 p-6">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
              {t("home.website")}
            </p>
            <a
              className="mt-3 inline-block break-all text-zinc-900 underline decoration-zinc-300 underline-offset-4"
              href={cv.website}
              rel="noreferrer"
              target="_blank"
            >
              {cv.website}
            </a>

            <div className="mt-7 border-t border-line pt-6">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                {t("home.skills")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cv.skills[locale].slice(0, 4).map((skill) => (
                  <span
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-zinc-700"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <Compass size={18} />
          </div>
          <p className="section-kicker !mb-0">{t("home.site")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div>
            <h2 className="editorial-title max-w-[16ch] text-[clamp(2rem,4vw,3.6rem)] leading-[0.97] tracking-[-0.05em]">
              {t("home.siteTitle")}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-700">{t("home.siteManifest")}</p>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[24px] border border-[color:var(--color-bronze)] bg-[linear-gradient(180deg,rgba(200,155,121,0.12),rgba(255,255,255,0.82))] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[color:var(--color-bronze)]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{t("home.featureCvStudioTitle")}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{t("home.featureCvStudioText")}</p>
                  </div>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-[0.68rem] uppercase tracking-[0.12em] text-white">
                  {t("home.featureActive")}
                </span>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[24px] border border-line bg-[color:var(--color-mist)] p-5">
                <p className="text-sm font-semibold text-zinc-900">{t("home.featureFutureOneTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{t("home.featureFutureOneText")}</p>
                <p className="mt-4 text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-bronze)]">
                  {t("home.featureComing")}
                </p>
              </article>

              <article className="rounded-[24px] border border-line bg-[color:var(--color-mist)] p-5">
                <p className="text-sm font-semibold text-zinc-900">{t("home.featureFutureTwoTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{t("home.featureFutureTwoText")}</p>
                <p className="mt-4 text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-bronze)]">
                  {t("home.featureComing")}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <Wrench size={18} />
          </div>
          <p className="section-kicker !mb-0">{t("home.skills")}</p>
        </div>

        <div>
          <h2 className="editorial-title text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.04em]">{t("home.skillsTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">{t("home.skillsIntro")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {cv.skills[locale].map((skill) => (
              <span
                className="rounded-full border border-line bg-white px-4 py-2 text-sm text-zinc-700 shadow-[0_10px_30px_rgba(21,21,21,0.04)]"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-4 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <BriefcaseBusiness size={18} />
          </div>
          <p className="section-kicker !mb-0">{t("cvStudio.experience")}</p>
        </div>

        <div>
          <h2 className="editorial-title py-4 text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.04em]">{t("home.experienceTitle")}</h2>
          {cv.experience.length > 0 ? (
            <div>
              {cv.experience.map((item) => (
                <article
                  className="grid gap-5 border-t border-line py-7 first:border-t-0 first:pt-2 lg:grid-cols-[180px_minmax(0,260px)_minmax(0,1fr)] lg:items-start"
                  key={item.id}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.company}</p>
                    <p className="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700">
                      {item.period}
                    </p>
                  </div>
                  <h3 className="editorial-title text-[1.7rem] leading-tight tracking-[-0.04em] text-zinc-900">{item.role[locale]}</h3>
                  <p className="text-sm leading-7 text-zinc-700">{item.achievements[locale]}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-4 text-sm text-zinc-500">{t("home.emptyExperience")}</p>
          )}
        </div>
      </section>

      <section className="surface-card px-7 py-8 sm:px-9">
        <div className="mb-4 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <GraduationCap size={18} />
          </div>
          <p className="section-kicker !mb-0">{t("cvStudio.education")}</p>
        </div>

        <div>
          <h2 className="editorial-title py-4 text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.04em]">{t("home.educationTitle")}</h2>
          {cv.education.length > 0 ? (
            <div>
              {cv.education.map((item) => (
                <article
                  className="grid gap-5 border-t border-line py-7 first:border-t-0 first:pt-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start"
                  key={item.id}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.school}</p>
                    <p className="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700">
                      {item.period}
                    </p>
                  </div>
                  <h3 className="editorial-title text-[1.7rem] leading-tight tracking-[-0.04em] text-zinc-900">{item.degree[locale]}</h3>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-4 text-sm text-zinc-500">{t("home.emptyEducation")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
