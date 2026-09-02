export type HeaderTheme = "dark" | "light";

export const HEADER_THEME_STORAGE_KEY = "tcf-learn-header-theme";
export const PAGE_THEME_ATTRIBUTE = "data-tcf-theme";

export function normalizeHeaderTheme(value: string | null | undefined): HeaderTheme {
  return value === "light" ? "light" : "dark";
}

export function nextHeaderTheme(theme: HeaderTheme): HeaderTheme {
  return theme === "dark" ? "light" : "dark";
}
