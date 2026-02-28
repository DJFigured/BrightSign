/**
 * Localized URL path mappings for sitemap and JSON-LD structured data.
 *
 * These translations are NOT used in Link components (which use internal Czech paths).
 * They ensure search engines see properly localized URLs in sitemap.xml and breadcrumbs.
 *
 * Internal paths (keys) match physical folder names inside [locale]/.
 * External paths (values per locale) are the SEO-visible URLs.
 */
const PATHNAMES: Record<string, string | Record<string, string>> = {
  "/": "/",
  "/kategorie": { en: "/categories", cs: "/kategorie", sk: "/kategorie", pl: "/kategorie", de: "/kategorien" },
  "/kategorie/[handle]": { en: "/categories/[handle]", cs: "/kategorie/[handle]", sk: "/kategorie/[handle]", pl: "/kategorie/[handle]", de: "/kategorien/[handle]" },
  "/produkt/[handle]": { en: "/products/[handle]", cs: "/produkt/[handle]", sk: "/produkt/[handle]", pl: "/produkt/[handle]", de: "/produkt/[handle]" },
  "/kosik": { en: "/cart", cs: "/kosik", sk: "/kosik", pl: "/koszyk", de: "/warenkorb" },
  "/pokladna": { en: "/checkout", cs: "/pokladna", sk: "/pokladna", pl: "/kasa", de: "/kasse" },
  "/ucet": { en: "/account", cs: "/ucet", sk: "/ucet", pl: "/konto", de: "/konto" },
  "/ucet/objednavka/[id]": { en: "/account/order/[id]", cs: "/ucet/objednavka/[id]", sk: "/ucet/objednavka/[id]", pl: "/konto/zamowienie/[id]", de: "/konto/bestellung/[id]" },
  "/prihlaseni": { en: "/login", cs: "/prihlaseni", sk: "/prihlaseni", pl: "/logowanie", de: "/anmelden" },
  "/registrace": { en: "/register", cs: "/registrace", sk: "/registracia", pl: "/rejestracja", de: "/registrieren" },
  "/kontakt": { en: "/contact", cs: "/kontakt", sk: "/kontakt", pl: "/kontakt", de: "/kontakt" },
  "/faq": "/faq",
  "/hledani": { en: "/search", cs: "/hledani", sk: "/hladanie", pl: "/szukaj", de: "/suche" },
  "/porovnani": { en: "/compare", cs: "/porovnani", sk: "/porovnanie", pl: "/porownanie", de: "/vergleich" },
  "/b2b/registrace": { en: "/b2b/register", cs: "/b2b/registrace", sk: "/b2b/registracia", pl: "/b2b/rejestracja", de: "/b2b/registrieren" },
  "/obchodni-podminky": { en: "/terms", cs: "/obchodni-podminky", sk: "/obchodne-podmienky", pl: "/regulamin", de: "/agb" },
  "/ochrana-udaju": { en: "/privacy", cs: "/ochrana-udaju", sk: "/ochrana-udajov", pl: "/polityka-prywatnosci", de: "/datenschutz" },
  "/reklamace": { en: "/returns", cs: "/reklamace", sk: "/reklamacie", pl: "/reklamacje", de: "/reklamation" },
  "/reseni": { en: "/solutions", cs: "/reseni", sk: "/riesenia", pl: "/rozwiazania", de: "/loesungen" },
  "/reseni/[slug]": { en: "/solutions/[slug]", cs: "/reseni/[slug]", sk: "/riesenia/[slug]", pl: "/rozwiazania/[slug]", de: "/loesungen/[slug]" },
}

/**
 * Resolve an internal (Czech) path to its localized external URL path.
 *
 * Static paths:  localizePath("/kategorie", "en") → "/categories"
 * Dynamic paths: localizePath("/kategorie/hd-prehravace", "en") → "/categories/hd-prehravace"
 */
export function localizePath(internalPath: string, locale: string): string {
  // 1. Exact static match
  const exact = PATHNAMES[internalPath]
  if (exact) {
    return typeof exact === "string"
      ? exact
      : exact[locale] || internalPath
  }

  // 2. Dynamic pattern match
  for (const [pattern, config] of Object.entries(PATHNAMES)) {
    if (!pattern.includes("[")) continue

    const regexStr = "^" + pattern.replace(/\[(\w+)\]/g, "([^/]+)") + "$"
    const match = internalPath.match(new RegExp(regexStr))
    if (!match) continue

    const localized =
      typeof config === "string"
        ? config
        : config[locale] || pattern

    let result = localized
    const paramNames = [...pattern.matchAll(/\[(\w+)\]/g)]
    paramNames.forEach((p, i) => {
      result = result.replace(`[${p[1]}]`, match[i + 1])
    })

    return result
  }

  return internalPath
}
