import * as fs from "node:fs"
import * as path from "node:path"
import { ScrapedFamily } from "../scraper/types.js"

const DATA_DIR = path.resolve(import.meta.dirname, "../../data/images")
const FETCH_DELAY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function sanitizeFilename(url: string): string {
  const parsed = new URL(url)
  const basename = path.basename(parsed.pathname)
  // Keep only safe chars
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function downloadFile(
  url: string,
  destPath: string
): Promise<boolean> {
  if (fs.existsSync(destPath)) {
    return true // Already downloaded
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    })
    if (!res.ok) {
      console.error(`    HTTP ${res.status} for ${url}`)
      return false
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buffer)
    return true
  } catch (err) {
    console.error(
      `    Download failed: ${err instanceof Error ? err.message : err}`
    )
    return false
  }
}

/** Download all images for a scraped family */
export async function downloadFamilyImages(
  family: ScrapedFamily
): Promise<{ downloaded: number; skipped: number; failed: number }> {
  const familyDir = path.join(DATA_DIR, family.familyCode)
  fs.mkdirSync(familyDir, { recursive: true })

  const allUrls: { url: string; type: string }[] = []

  if (family.images.hero) {
    allUrls.push({ url: family.images.hero, type: "hero" })
  }
  if (family.images.product) {
    allUrls.push({ url: family.images.product, type: "product" })
  }
  if (family.images.thumbnail && family.images.thumbnail !== family.images.product) {
    allUrls.push({ url: family.images.thumbnail, type: "thumb" })
  }
  for (const gUrl of family.images.gallery) {
    allUrls.push({ url: gUrl, type: "gallery" })
  }

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const { url, type } of allUrls) {
    const filename = `${type}-${sanitizeFilename(url)}`
    const destPath = path.join(familyDir, filename)

    if (fs.existsSync(destPath)) {
      skipped++
      continue
    }

    const ok = await downloadFile(url, destPath)
    if (ok) {
      downloaded++
    } else {
      failed++
    }
    await delay(FETCH_DELAY_MS)
  }

  return { downloaded, skipped, failed }
}

/** Download images for all families */
export async function downloadAllImages(
  families: ScrapedFamily[]
): Promise<void> {
  for (const family of families) {
    console.log(`  Downloading images for ${family.familyCode}...`)
    const result = await downloadFamilyImages(family)
    console.log(
      `    ${result.downloaded} new, ${result.skipped} cached, ${result.failed} failed`
    )
  }
}

/** Get local image paths for a family */
export function getLocalImagePaths(familyCode: string): string[] {
  const familyDir = path.join(DATA_DIR, familyCode)
  if (!fs.existsSync(familyDir)) return []
  return fs
    .readdirSync(familyDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .map((f) => path.join(familyDir, f))
}
