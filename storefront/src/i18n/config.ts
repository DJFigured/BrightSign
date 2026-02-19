export const locales = ["cs", "sk", "pl", "en", "de"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "cs"

export const localeNames: Record<Locale, string> = {
  cs: "Čeština",
  sk: "Slovenčina",
  pl: "Polski",
  en: "English",
  de: "Deutsch",
}

export const regionMap: Record<Locale, string> = {
  cs: "CZ",
  sk: "SK",
  pl: "PL",
  en: "EU",
  de: "EU",
}
