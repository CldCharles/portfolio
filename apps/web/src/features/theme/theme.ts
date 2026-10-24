export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'portfolio_theme';
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Theme currently displayed: the explicit choice on <html data-theme>, otherwise the system setting. */
export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the choice right away and keeps it in a cookie, so the server renders the next page in that theme. */
export function chooseTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
}
