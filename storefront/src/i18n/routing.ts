import { defineRouting } from "next-intl/routing"
import { locales, defaultLocale } from "./config"

/**
 * Domain-based routing — each domain serves exactly one locale.
 *
 * URL path translation (e.g. /kategorie → /categories on EN domain)
 * is NOT enabled here because it requires updating all Link components
 * to use the object-form href. For now, all domains use Czech URL paths.
 * Localized URLs are used in sitemap and JSON-LD via localizePath().
 *
 * TODO: Enable pathnames config + update all Link components to use
 * {pathname: "/kategorie/[handle]", params: {handle}} form.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "never",
  domains: [
    {
      domain: "ebrightsign.eu",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "brightsign.cz",
      defaultLocale: "cs",
      locales: ["cs"],
    },
    {
      domain: "brightsign.sk",
      defaultLocale: "sk",
      locales: ["sk"],
    },
    {
      domain: "brightsign.pl",
      defaultLocale: "pl",
      locales: ["pl"],
    },
  ],
})
