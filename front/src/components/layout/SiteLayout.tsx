import { Languages, Menu } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import { localeLabels } from "../../features/cv/constants";
import { toLocale } from "../../i18n";

export function SiteLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const currentLocale = toLocale(i18n.resolvedLanguage ?? i18n.language);
  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative pb-1 text-sm text-zinc-700 transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform hover:after:scale-x-100",
      isActive ? "after:scale-x-100" : "",
    ].join(" ");

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-18 pt-5 sm:px-5">
      <header className="print-hidden sticky top-4 z-10 mb-7 flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-line bg-white/80 px-4 py-3.5 shadow-[var(--shadow-soft)] backdrop-blur-md">
        <NavLink className="inline-flex items-center gap-3 font-semibold tracking-[-0.03em]" to="/">
          <span className="grid h-8.5 w-8.5 place-items-center rounded-full bg-black text-sm text-white">
            C
          </span>
          <span>Charles</span>
        </NavLink>

        <button
          aria-label={t("nav.openMenu")}
          className="inline-flex h-10.5 w-10.5 items-center justify-center rounded-xl bg-zinc-100 text-black md:hidden"
          onClick={() => setMobileMenuOpen((current) => !current)}
          type="button"
        >
          <Menu size={18} />
        </button>

        <nav
          className={[
            "w-full flex-col items-start gap-3 pt-2 md:flex md:w-auto md:flex-row md:items-center md:gap-5 md:pt-0",
            mobileMenuOpen ? "flex" : "hidden",
          ].join(" ")}
        >
          <NavLink
            className={navClass}
            end
            onClick={() => setMobileMenuOpen(false)}
            to="/"
          >
            {t("nav.home")}
          </NavLink>
          <NavLink
            className={navClass}
            onClick={() => setMobileMenuOpen(false)}
            to="/cv-studio"
          >
            {t("nav.cvStudio")}
          </NavLink>
        </nav>

        <div className="relative ml-auto">
          <button
            aria-label={t("nav.switchLanguage")}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm text-zinc-700 transition hover:-translate-y-0.5"
            onClick={() => setLanguageMenuOpen((current) => !current)}
            type="button"
          >
            <Languages size={16} />
            <span>{localeLabels[currentLocale]}</span>
          </button>

          {languageMenuOpen ? (
            <div className="absolute right-0 top-12 z-20 min-w-36 rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-soft)]">
              {(["fr", "en", "ko"] as const).map((locale) => (
                <button
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    currentLocale === locale
                      ? "bg-black text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                  key={locale}
                  onClick={() => {
                    void i18n.changeLanguage(locale);
                    setLanguageMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>{localeLabels[locale]}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <Outlet />
    </div>
  );
}
