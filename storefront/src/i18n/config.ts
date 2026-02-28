export const locales = ["cs", "sk", "pl", "en", "de"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

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

/** Domain-to-locale configuration. Each domain serves exactly one locale. */
export interface DomainConfig {
  locale: Locale
  region: string
  currency: string
  storeName: string
  siteUrl: string
}

export const domainConfigMap: Record<string, DomainConfig> = {
  "ebrightsign.eu": {
    locale: "en",
    region: "EU",
    currency: "EUR",
    storeName: "eBrightSign.eu",
    siteUrl: "https://ebrightsign.eu",
  },
  "www.ebrightsign.eu": {
    locale: "en",
    region: "EU",
    currency: "EUR",
    storeName: "eBrightSign.eu",
    siteUrl: "https://ebrightsign.eu",
  },
  "brightsign.cz": {
    locale: "cs",
    region: "CZ",
    currency: "CZK",
    storeName: "BrightSign.cz",
    siteUrl: "https://brightsign.cz",
  },
  "www.brightsign.cz": {
    locale: "cs",
    region: "CZ",
    currency: "CZK",
    storeName: "BrightSign.cz",
    siteUrl: "https://brightsign.cz",
  },
  "brightsign.sk": {
    locale: "sk",
    region: "SK",
    currency: "EUR",
    storeName: "BrightSign.sk",
    siteUrl: "https://brightsign.sk",
  },
  "www.brightsign.sk": {
    locale: "sk",
    region: "SK",
    currency: "EUR",
    storeName: "BrightSign.sk",
    siteUrl: "https://brightsign.sk",
  },
  "brightsign.pl": {
    locale: "pl",
    region: "PL",
    currency: "PLN",
    storeName: "BrightSign.pl",
    siteUrl: "https://brightsign.pl",
  },
  "www.brightsign.pl": {
    locale: "pl",
    region: "PL",
    currency: "PLN",
    storeName: "BrightSign.pl",
    siteUrl: "https://brightsign.pl",
  },
}

/** Get domain config for the current hostname, with fallback to ebrightsign.eu */
export function getDomainConfig(hostname: string): DomainConfig {
  const domain = hostname.split(":")[0] // Strip port for dev
  return domainConfigMap[domain] ?? domainConfigMap["ebrightsign.eu"]
}

/** Get domain config by locale (for server components that know locale but not hostname) */
export function getDomainConfigByLocale(locale: Locale): DomainConfig {
  const entry = allDomains.find(d => d.locale === locale)
  if (entry) {
    return domainConfigMap[entry.domain] || domainConfigMap["ebrightsign.eu"]
  }
  return domainConfigMap["ebrightsign.eu"]
}

/** All domain configs (unique by siteUrl) for generating hreflang alternates */
export const allDomains: Array<{ domain: string; locale: Locale; siteUrl: string }> = [
  { domain: "ebrightsign.eu", locale: "en", siteUrl: "https://ebrightsign.eu" },
  { domain: "brightsign.cz", locale: "cs", siteUrl: "https://brightsign.cz" },
  { domain: "brightsign.sk", locale: "sk", siteUrl: "https://brightsign.sk" },
  { domain: "brightsign.pl", locale: "pl", siteUrl: "https://brightsign.pl" },
]
