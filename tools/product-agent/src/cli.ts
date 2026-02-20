import { Command } from "commander"
import * as fs from "node:fs"
import * as path from "node:path"
import { getFamiliesBySeries, FAMILY_URLS } from "./scraper/product-urls.js"
import { scrapeSeries } from "./scraper/brightsign-biz.js"
import { downloadAllImages } from "./images/downloader.js"
import { generateAllDescriptions } from "./content/description-generator.js"
import { translateAll } from "./content/translator.js"
import type { ScrapedFamily, GeneratedContent } from "./scraper/types.js"

const DATA_DIR = path.resolve(import.meta.dirname, "../data")
const SCRAPED_FILE = path.join(DATA_DIR, "scraped", "scraped-products.json")
const GENERATED_FILE = path.join(DATA_DIR, "generated", "generated-content.json")
const TRANSLATED_FILE = path.join(DATA_DIR, "generated", "translations.json")

function ensureDirs() {
  fs.mkdirSync(path.join(DATA_DIR, "scraped"), { recursive: true })
  fs.mkdirSync(path.join(DATA_DIR, "generated"), { recursive: true })
  fs.mkdirSync(path.join(DATA_DIR, "images"), { recursive: true })
}

function loadScraped(): ScrapedFamily[] {
  if (!fs.existsSync(SCRAPED_FILE)) return []
  return JSON.parse(fs.readFileSync(SCRAPED_FILE, "utf-8"))
}

function saveScraped(data: ScrapedFamily[]) {
  fs.writeFileSync(SCRAPED_FILE, JSON.stringify(data, null, 2))
}

function loadGenerated(): GeneratedContent[] {
  if (!fs.existsSync(GENERATED_FILE)) return []
  return JSON.parse(fs.readFileSync(GENERATED_FILE, "utf-8"))
}

function saveGenerated(data: GeneratedContent[]) {
  fs.writeFileSync(GENERATED_FILE, JSON.stringify(data, null, 2))
}

const program = new Command()
program
  .name("product-agent")
  .description("BrightSign product data agent - scrape, generate, translate")
  .version("1.0.0")

// ── SCRAPE ──
program
  .command("scrape")
  .description("Scrape product data from brightsign.biz")
  .option("-s, --series <number>", "Series to scrape (4, 5, 6)", "6")
  .option("-f, --family <code>", "Single family to scrape (e.g., hd6)")
  .option("--all", "Scrape all series (5 + 6)")
  .action(async (opts) => {
    ensureDirs()
    console.log("=== BrightSign Product Scraper ===\n")

    let families = FAMILY_URLS

    if (opts.family) {
      families = families.filter((f) => f.familyCode === opts.family)
      if (!families.length) {
        console.error(`Unknown family: ${opts.family}`)
        process.exit(1)
      }
    } else if (opts.all) {
      families = [...getFamiliesBySeries("6"), ...getFamiliesBySeries("5")]
    } else {
      families = getFamiliesBySeries(opts.series)
    }

    console.log(`Scraping ${families.length} families...\n`)
    const results = await scrapeSeries(families)

    // Merge with existing data (update by familyCode)
    const existing = loadScraped()
    const merged = [...existing]
    for (const result of results) {
      const idx = merged.findIndex((e) => e.familyCode === result.familyCode)
      if (idx >= 0) {
        merged[idx] = result
      } else {
        merged.push(result)
      }
    }

    saveScraped(merged)

    const totalModels = results.reduce((sum, f) => sum + f.models.length, 0)
    console.log(`\nDone! ${results.length} families, ${totalModels} models scraped.`)
    console.log(`Data saved to: ${SCRAPED_FILE}`)
  })

// ── IMAGES ──
program
  .command("images")
  .description("Download product images from brightsign.biz")
  .option("-s, --series <number>", "Series to download (4, 5, 6)")
  .option("-f, --family <code>", "Single family to download")
  .action(async (opts) => {
    ensureDirs()
    console.log("=== BrightSign Image Downloader ===\n")

    let families = loadScraped()
    if (!families.length) {
      console.error("No scraped data found. Run 'scrape' first.")
      process.exit(1)
    }

    if (opts.family) {
      families = families.filter((f) => f.familyCode === opts.family)
    } else if (opts.series) {
      families = families.filter((f) => f.series === opts.series)
    }

    console.log(`Downloading images for ${families.length} families...\n`)
    await downloadAllImages(families)
    console.log("\nDone!")
  })

// ── GENERATE ──
program
  .command("generate")
  .description("Generate Czech product descriptions via Claude API")
  .option("-s, --series <number>", "Series to generate (4, 5, 6)")
  .option("-f, --family <code>", "Single family to generate")
  .option("-m, --model <number>", "Single model to generate (e.g., HD226)")
  .option("--overwrite", "Overwrite existing generated content")
  .action(async (opts) => {
    ensureDirs()
    console.log("=== BrightSign Content Generator ===\n")

    let families = loadScraped()
    if (!families.length) {
      console.error("No scraped data found. Run 'scrape' first.")
      process.exit(1)
    }

    if (opts.family) {
      families = families.filter((f) => f.familyCode === opts.family)
    } else if (opts.series) {
      families = families.filter((f) => f.series === opts.series)
    }

    // Filter out models that already have generated content (unless --overwrite)
    const existing = loadGenerated()
    const existingModels = new Set(existing.map((e) => e.modelNumber))

    if (!opts.overwrite && !opts.model) {
      for (const family of families) {
        family.models = family.models.filter(
          (m) => !existingModels.has(m.modelNumber)
        )
      }
      families = families.filter((f) => f.models.length > 0)
    }

    if (opts.model) {
      for (const family of families) {
        family.models = family.models.filter(
          (m) => m.modelNumber === opts.model
        )
      }
      families = families.filter((f) => f.models.length > 0)
    }

    const totalModels = families.reduce((sum, f) => sum + f.models.length, 0)
    if (totalModels === 0) {
      console.log("No new models to generate. Use --overwrite to regenerate.")
      return
    }

    console.log(`Generating descriptions for ${totalModels} models...\n`)
    const results = await generateAllDescriptions(families)

    // Merge with existing
    const merged = [...existing]
    for (const result of results) {
      const idx = merged.findIndex((e) => e.modelNumber === result.modelNumber)
      if (idx >= 0) {
        merged[idx] = result
      } else {
        merged.push(result)
      }
    }

    saveGenerated(merged)
    console.log(`\nDone! ${results.length} descriptions generated.`)
    console.log(`Data saved to: ${GENERATED_FILE}`)
    console.log("\nReview the generated content before importing to Medusa!")
  })

// ── TRANSLATE ──
program
  .command("translate")
  .description("Translate Czech descriptions to other languages")
  .option("-l, --locale <code>", "Single locale (sk, pl, en, de)")
  .option("-m, --model <number>", "Single model to translate")
  .action(async (opts) => {
    ensureDirs()
    console.log("=== BrightSign Content Translator ===\n")

    let contents = loadGenerated()
    if (!contents.length) {
      console.error("No generated content found. Run 'generate' first.")
      process.exit(1)
    }

    if (opts.model) {
      contents = contents.filter((c) => c.modelNumber === opts.model)
    }

    const locales = opts.locale ? [opts.locale] : undefined

    console.log(
      `Translating ${contents.length} products to ${locales?.join(", ") || "sk, pl, en, de"}...\n`
    )
    const results = await translateAll(contents, locales)

    // Save translations
    const translationsMap: Record<string, Record<string, unknown>> = {}
    if (fs.existsSync(TRANSLATED_FILE)) {
      Object.assign(
        translationsMap,
        JSON.parse(fs.readFileSync(TRANSLATED_FILE, "utf-8"))
      )
    }

    for (const [modelNumber, translations] of results) {
      if (!translationsMap[modelNumber]) {
        translationsMap[modelNumber] = {}
      }
      for (const t of translations) {
        translationsMap[modelNumber][t.locale] = t
      }
    }

    fs.writeFileSync(TRANSLATED_FILE, JSON.stringify(translationsMap, null, 2))
    console.log(`\nDone! Translations saved to: ${TRANSLATED_FILE}`)
  })

// ── STATUS ──
program
  .command("status")
  .description("Show status of scraped/generated/translated data")
  .action(async () => {
    console.log("=== BrightSign Product Agent Status ===\n")

    // Scraped data
    const scraped = loadScraped()
    const totalScrapedModels = scraped.reduce(
      (sum, f) => sum + f.models.length,
      0
    )
    console.log(`Scraped families: ${scraped.length}`)
    console.log(`Scraped models:   ${totalScrapedModels}`)

    if (scraped.length) {
      for (const family of scraped) {
        const models = family.models.map((m) => m.modelNumber).join(", ")
        const imgs = family.images.gallery.length
        console.log(
          `  ${family.familyCode} (S${family.series}): ${family.models.length} models [${models}], ${imgs} images`
        )
      }
    }

    // Generated content
    const generated = loadGenerated()
    console.log(`\nGenerated descriptions: ${generated.length}`)
    for (const g of generated) {
      console.log(
        `  ${g.modelNumber} (S${g.series}): "${g.title}"`
      )
    }

    // Translations
    if (fs.existsSync(TRANSLATED_FILE)) {
      const translations = JSON.parse(
        fs.readFileSync(TRANSLATED_FILE, "utf-8")
      )
      const modelCount = Object.keys(translations).length
      console.log(`\nTranslated models: ${modelCount}`)
      for (const [model, locales] of Object.entries(translations)) {
        const localeKeys = Object.keys(locales as Record<string, unknown>).join(", ")
        console.log(`  ${model}: ${localeKeys}`)
      }
    } else {
      console.log("\nTranslations: none")
    }

    // Images
    const imgDir = path.join(DATA_DIR, "images")
    if (fs.existsSync(imgDir)) {
      const familyDirs = fs
        .readdirSync(imgDir)
        .filter((d) =>
          fs.statSync(path.join(imgDir, d)).isDirectory()
        )
      let totalImages = 0
      for (const dir of familyDirs) {
        const files = fs
          .readdirSync(path.join(imgDir, dir))
          .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
        totalImages += files.length
      }
      console.log(`\nDownloaded images: ${totalImages} files in ${familyDirs.length} folders`)
    } else {
      console.log("\nDownloaded images: none")
    }
  })

program.parse()
