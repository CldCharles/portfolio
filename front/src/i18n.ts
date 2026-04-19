import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "./types";
import { resources } from "./i18n/resources";

const LANGUAGE_STORAGE_KEY = "portfolio-site-language";

function getInitialLanguage(): Locale {
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "fr" || saved === "en" || saved === "ko") {
    return saved;
  }
  return "fr";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (language === "fr" || language === "en" || language === "ko") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
});

export function toLocale(language: string): Locale {
  if (language.startsWith("en")) return "en";
  if (language.startsWith("ko")) return "ko";
  return "fr";
}

export default i18n;
