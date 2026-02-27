import { ScrapedFamily, ScrapedModel } from "../scraper/types.js"

/**
 * System prompt establishing the product copywriter persona.
 * Ensures consistent tone, style, and structure across all products.
 */
export const SYSTEM_PROMPT = `Jsi zkušený produktový copywriter pro BrightSign.cz - český e-shop s digital signage přehrávači BrightSign.

## Tvůj styl psaní:
- Profesionální, ale přístupný - piš pro IT manažery a AV integrátory, kteří rozumí technologiím
- Konkrétní a věcný - žádné prázdné fráze, každá věta musí přinést hodnotu
- Technicky přesný - specifikace musí přesně odpovídat oficiálním datům
- Přesvědčivý bez agresivity - vyzdvihni benefity, ne jen funkce
- Český jazyk na vysoké úrovni - přirozený, ne strojový překlad

## Struktura popisků (dodržuj konzistentně pro VŠECHNY produkty):

### Titulek (title):
Formát: "BrightSign {MODEL} – {hlavní benefit, max 6 slov}"
Příklady: "BrightSign HD226 – Spolehlivý 4K přehrávač s HDR"

### Podtitulek (subtitle):
Jedna věta shrnující klíčovou hodnotu produktu pro zákazníka.
Max 120 znaků. Zaměř se na use-case, ne na technické detaily.

### Popis (description):
HTML formát s touto pevnou strukturou:

1. **Úvodní odstavec** (2-3 věty): Co produkt je a proč si ho zákazník má koupit.
   Zmíň sérii, hlavní diferenciátor oproti konkurenci/nižším modelům.

2. **<h3>Klíčové vlastnosti</h3>** + <ul> seznam 4-6 vlastností:
   Každá položka = benefit + technický detail.
   Formát: "<strong>{Benefit}</strong> – {technické vysvětlení}"

3. **<h3>Technické specifikace</h3>** + <table> s nejdůležitějšími specs:
   Rozlišení, video kodeky, výstupy, konektivita, PoE, úložiště, rozměry, záruka.

4. **<h3>Ideální využití</h3>** + <ul> seznam 3-4 use-casů:
   Konkrétní scénáře nasazení relevantní pro daný model.

5. **Závěrečný odstavec** (1-2 věty): Zmíň záruku, sérii a odkaz na ekosystém BrightSign.

### SEO title:
Formát: "BrightSign {MODEL} - {typ} Digital Signage Přehrávač | BrightSign.cz"
Max 60 znaků.

### SEO description:
Formát: "{MODEL} {hlavní benefit}. {2-3 klíčové vlastnosti}. Skladem, doprava do 48h."
Max 155 znaků.

## Pravidla:
- Produktové číslo (PN) uváděj PŘESNĚ jak je v datech (HD226, ne HD-226 nebo HD 226)
- "Série 6" / "Série 5" - vždy s velkým S, česky
- Záruka: Série 6 = 5 let, Série 5 = 5 let, Série 4 = 2 roky
- BrightSign je vždy s velkým B a S (camelCase)
- Nepoužívej emoji
- Nepiš "nejlepší", "revoluční" nebo jiné superlativy bez konkrétního podkladu
- PoE+ / PoE++ piš přesně podle specifikací
- Kodeky odděluj čárkou: H.265, H.264, VP9`

/**
 * Build the user prompt for generating a product description.
 * Includes all scraped data so Claude can write accurate, original copy.
 */
export function buildGeneratePrompt(
  family: ScrapedFamily,
  model: ScrapedModel
): string {
  const specsFormatted = Object.entries(model.specs)
    .map(([key, val]) => `  ${key}: ${val}`)
    .join("\n")

  return `Vygeneruj produktový popisek pro model **${model.modelNumber}** z rodiny ${family.name} (Série ${family.series}).

## Data z oficiálního webu brightsign.biz:

### Rodina: ${family.name}
Tagline: ${family.tagline || "(není)"}

### Overview text:
${family.overviewText.join("\n") || "(není)"}

### Feature bullets:
${family.featureBullets.map((b) => `- ${b}`).join("\n") || "(nejsou)"}

### Technické specifikace modelu ${model.modelNumber}:
${specsFormatted || "(nejsou)"}

## Požadovaný výstup:
Vrať JSON objekt s těmito klíči:
{
  "title": "...",
  "subtitle": "...",
  "description": "...(HTML)...",
  "seoTitle": "...",
  "seoDescription": "..."
}

DŮLEŽITÉ:
- Piš ORIGINÁLNÍ český text, NEKOPÍRUJ anglické věty z overview
- Technické údaje musí PŘESNĚ odpovídat specifikacím výše
- Produktové číslo je přesně "${model.modelNumber}"
- Zachovej konzistentní strukturu popisu (viz systémový prompt)
- Description je HTML (používej <h3>, <ul>, <li>, <table>, <strong>, <p>)
- Vrať POUZE validní JSON, žádný markdown kolem`
}

/**
 * Build prompt for translating Czech content to another language.
 */
export function buildTranslatePrompt(
  modelNumber: string,
  czechContent: { title: string; subtitle: string; description: string; seoTitle: string; seoDescription: string },
  targetLocale: string
): string {
  const langNames: Record<string, string> = {
    sk: "slovenštiny",
    pl: "polštiny",
    en: "angličtiny",
    de: "němčiny",
  }
  const langName = langNames[targetLocale] || targetLocale

  return `Přelož následující produktový popisek pro ${modelNumber} do ${langName}.

## Pravidla překladu:
- Zachovej HTML strukturu beze změny (tagy, třídy)
- Produktové číslo "${modelNumber}" NEMĚŇ
- "BrightSign" NEMĚŇ
- Technické údaje (rozlišení, kodeky, rozměry) NEMĚŇ
- SEO title: max 60 znaků, SEO description: max 155 znaků
- Pro slovenštinu: piš přirozeně slovensky, ne "počeštěnou slovenštinou"
- Pro polštinu: piš přirozeně polsky, správné skloňování a pády
- Pro angličtinu: profesionální B2B tón, British English
- Pro němčinu: formální Sie-Form, technický B2B styl

## Český originál:

Title: ${czechContent.title}

Subtitle: ${czechContent.subtitle}

Description:
${czechContent.description}

SEO Title: ${czechContent.seoTitle}

SEO Description: ${czechContent.seoDescription}

## Požadovaný výstup:
Vrať JSON objekt:
{
  "title": "...",
  "subtitle": "...",
  "description": "...(HTML)...",
  "seoTitle": "...",
  "seoDescription": "..."
}

Vrať POUZE validní JSON, žádný markdown kolem.`
}
