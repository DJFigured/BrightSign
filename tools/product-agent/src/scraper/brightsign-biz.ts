import * as cheerio from "cheerio"
import { ScrapedFamily, ScrapedModel } from "./types.js"
import { FamilyUrlEntry, getFullUrl } from "./product-urls.js"

const FETCH_DELAY_MS = 1500

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`)
  }
  return res.text()
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Extract background-image URL from inline style */
function extractBgUrl(style: string | undefined): string | null {
  if (!style) return null
  const match = style.match(/url\(['"]?([^'")+]+?)['"]?\)/)
  return match ? match[1] : null
}

/** Clean text: remove extra whitespace, decode entities */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#10004;/g, "\u2714")
    .trim()
}

/** Scrape a single family page (e.g., /brightsign-players/series-6/hd6/) */
export async function scrapeFamilyPage(
  entry: FamilyUrlEntry
): Promise<ScrapedFamily> {
  const url = getFullUrl(entry.path)
  console.log(`  Fetching ${url}...`)
  const html = await fetchPage(url)
  const $ = cheerio.load(html)

  // Hero section (take first h1 only - page has desktop + mobile duplicates)
  const heroTitle = cleanText($("section.hero h1").first().text())
  const heroTagline = cleanText(
    $("section.hero .block-inner-content p").first().text()
  )
  const heroBgStyle = $("#hero-desktop-background").attr("style")
  const heroImage = extractBgUrl(heroBgStyle)

  // Tab 1: Product Overview
  const overviewText: string[] = []
  const featureBullets: string[] = []
  $(".simple-tab-wysiwyg")
    .first()
    .find("> p")
    .each((_, el) => {
      const t = cleanText($(el).text())
      if (t) overviewText.push(t)
    })
  $(".simple-tab-wysiwyg")
    .first()
    .find("ul li")
    .each((_, el) => {
      const t = cleanText($(el).text())
      if (t) featureBullets.push(t)
    })

  // Product image from overview tab
  const productImage =
    $(".simple-tab-image-wrap img").attr("src") || null

  // Datasheet PDF
  const datasheetUrl =
    $(".simple-tab-ctas a[href$='.pdf']").first().attr("href") || null

  // Tab 2: Gallery images
  const galleryImages: string[] = []
  $(".tabbed-swiper1 .swiper-slide img").each((_, el) => {
    const src = $(el).attr("src")
    if (src) galleryImages.push(src)
  })

  // Also check for additional swiper galleries (tabbed-swiper2 etc)
  $("[class*='tabbed-swiper'] .swiper-slide img").each((_, el) => {
    const src = $(el).attr("src")
    if (src && !galleryImages.includes(src)) galleryImages.push(src)
  })

  // Tab 3: Specs table (TablePress)
  const models: ScrapedModel[] = []
  const table = $("table.tablepress").first()

  if (table.length) {
    // Extract model names from header row
    const modelHeaders: { name: string; colIdx: number }[] = []
    table.find("thead tr th, thead tr td").each((i, el) => {
      if (i === 0) return // Skip first column (spec names)
      const name = cleanText($(el).text())
      if (name) {
        modelHeaders.push({ name, colIdx: i + 1 }) // 1-based column class
      }
    })

    // Parse spec rows
    const specsPerModel: Record<string, Record<string, string>> = {}
    for (const h of modelHeaders) {
      specsPerModel[h.name] = {}
    }

    table.find("tbody tr").each((_, row) => {
      const cells = $(row).find("td")
      const specName = cleanText(cells.first().text())
      if (!specName) return

      modelHeaders.forEach((header, idx) => {
        const cellIdx = idx + 1 // Skip first td (spec name)
        const value = cleanText($(cells.eq(cellIdx)).text())
        if (value) {
          specsPerModel[header.name][specName] = value
        }
      })
    })

    // Build model objects
    for (const header of modelHeaders) {
      models.push({
        modelNumber: header.name,
        columnIndex: header.colIdx,
        specs: specsPerModel[header.name],
      })
    }
  }

  // Thumbnail from series page slider (fetch separately if needed)
  // For now, use the product image as thumbnail fallback
  const thumbnail = productImage

  return {
    familyCode: entry.familyCode,
    series: entry.series,
    name: heroTitle || `BrightSign ${entry.familyCode.toUpperCase()}`,
    tagline: heroTagline,
    overviewText,
    featureBullets,
    datasheetUrl,
    images: {
      hero: heroImage,
      product: productImage,
      gallery: galleryImages,
      thumbnail,
    },
    models,
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
  }
}

/** Scrape all families in a series */
export async function scrapeSeries(
  families: FamilyUrlEntry[]
): Promise<ScrapedFamily[]> {
  const results: ScrapedFamily[] = []

  for (const family of families) {
    try {
      const data = await scrapeFamilyPage(family)
      results.push(data)
      console.log(
        `  OK: ${data.name} - ${data.models.length} models, ${data.images.gallery.length} gallery images`
      )
    } catch (err) {
      console.error(
        `  FAIL: ${family.familyCode} - ${err instanceof Error ? err.message : err}`
      )
    }
    await delay(FETCH_DELAY_MS)
  }

  return results
}
