import * as fs from "node:fs"
import * as path from "node:path"
import sharp from "sharp"

const DATA_DIR = path.resolve(import.meta.dirname, "../../data/images")
const OUTPUT_DIR = path.resolve(import.meta.dirname, "../../data/images-optimized")

interface ProcessingConfig {
  /** Max width for product/gallery images */
  galleryMaxWidth: number
  /** Max width for thumbnail images */
  thumbWidth: number
  /** WebP quality (1-100) */
  webpQuality: number
  /** Whether to skip hero banners */
  skipHero: boolean
  /** Whether to overwrite existing optimized files */
  overwrite: boolean
}

const DEFAULT_CONFIG: ProcessingConfig = {
  galleryMaxWidth: 1200,
  thumbWidth: 400,
  webpQuality: 82,
  skipHero: true,
  overwrite: false,
}

interface ProcessingResult {
  family: string
  processed: number
  skipped: number
  failed: number
  savedBytes: number
}

async function processImage(
  inputPath: string,
  outputPath: string,
  maxWidth: number,
  quality: number
): Promise<{ originalSize: number; newSize: number }> {
  const originalSize = fs.statSync(inputPath).size
  const meta = await sharp(inputPath).metadata()

  let pipeline = sharp(inputPath)

  // Only resize if wider than maxWidth
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, undefined, { withoutEnlargement: true })
  }

  await pipeline.webp({ quality }).toFile(outputPath)

  const newSize = fs.statSync(outputPath).size
  return { originalSize, newSize }
}

/** Process all images for a single family */
async function processFamilyImages(
  familyCode: string,
  config: ProcessingConfig
): Promise<ProcessingResult> {
  const inputDir = path.join(DATA_DIR, familyCode)
  const outputDir = path.join(OUTPUT_DIR, familyCode)
  const thumbDir = path.join(outputDir, "thumbs")

  if (!fs.existsSync(inputDir)) {
    console.log(`  No images found for ${familyCode}`)
    return { family: familyCode, processed: 0, skipped: 0, failed: 0, savedBytes: 0 }
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.mkdirSync(thumbDir, { recursive: true })

  const files = fs
    .readdirSync(inputDir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))

  let processed = 0
  let skipped = 0
  let failed = 0
  let savedBytes = 0

  for (const file of files) {
    const isHero = file.startsWith("hero-")
    if (config.skipHero && isHero) {
      skipped++
      continue
    }

    const baseName = file.replace(/\.(png|jpg|jpeg|webp)$/i, "")
    const webpName = `${baseName}.webp`
    const outputPath = path.join(outputDir, webpName)
    const thumbPath = path.join(thumbDir, webpName)
    const inputPath = path.join(inputDir, file)

    // Skip if already processed (unless overwrite)
    if (!config.overwrite && fs.existsSync(outputPath)) {
      skipped++
      continue
    }

    try {
      // Main optimized image
      const mainResult = await processImage(
        inputPath,
        outputPath,
        config.galleryMaxWidth,
        config.webpQuality
      )

      // Thumbnail
      await processImage(
        inputPath,
        thumbPath,
        config.thumbWidth,
        config.webpQuality - 5 // slightly lower quality for thumbs
      )

      savedBytes += mainResult.originalSize - mainResult.newSize
      processed++

      const savePct = Math.round(
        ((mainResult.originalSize - mainResult.newSize) / mainResult.originalSize) * 100
      )
      console.log(
        `    ${file} → ${webpName} (${formatBytes(mainResult.originalSize)} → ${formatBytes(mainResult.newSize)}, -${savePct}%)`
      )
    } catch (err) {
      console.error(
        `    FAILED ${file}: ${err instanceof Error ? err.message : err}`
      )
      failed++
    }
  }

  return { family: familyCode, processed, skipped, failed, savedBytes }
}

/** Process images for all families */
export async function processAllImages(
  options: Partial<ProcessingConfig> & { family?: string; series?: string } = {}
): Promise<void> {
  const config: ProcessingConfig = { ...DEFAULT_CONFIG, ...options }

  console.log("Configuration:")
  console.log(`  Max width: ${config.galleryMaxWidth}px`)
  console.log(`  Thumb width: ${config.thumbWidth}px`)
  console.log(`  WebP quality: ${config.webpQuality}`)
  console.log(`  Skip hero banners: ${config.skipHero}`)
  console.log(`  Overwrite: ${config.overwrite}`)
  console.log(`  Output: ${OUTPUT_DIR}\n`)

  if (!fs.existsSync(DATA_DIR)) {
    console.error("No images directory found. Run 'images' command first.")
    return
  }

  let familyDirs = fs
    .readdirSync(DATA_DIR)
    .filter((d) => fs.statSync(path.join(DATA_DIR, d)).isDirectory())

  if (options.family) {
    familyDirs = familyDirs.filter((d) => d === options.family)
  }

  if (options.series) {
    // Family codes end with series number (hd5, xd6, etc.)
    familyDirs = familyDirs.filter((d) => d.endsWith(options.series!))
  }

  if (!familyDirs.length) {
    console.log("No matching family directories found.")
    return
  }

  let totalProcessed = 0
  let totalSkipped = 0
  let totalFailed = 0
  let totalSaved = 0

  for (const familyCode of familyDirs) {
    console.log(`  Processing ${familyCode}...`)
    const result = await processFamilyImages(familyCode, config)
    totalProcessed += result.processed
    totalSkipped += result.skipped
    totalFailed += result.failed
    totalSaved += result.savedBytes
  }

  console.log(`\n--- Summary ---`)
  console.log(`Processed: ${totalProcessed}`)
  console.log(`Skipped:   ${totalSkipped}`)
  console.log(`Failed:    ${totalFailed}`)
  if (totalSaved > 0) {
    console.log(`Saved:     ${formatBytes(totalSaved)}`)
  }
}

/** Get optimized image paths for a family (for Medusa upload) */
export function getOptimizedImagePaths(familyCode: string): {
  images: string[]
  thumbnails: string[]
} {
  const outputDir = path.join(OUTPUT_DIR, familyCode)
  const thumbDir = path.join(outputDir, "thumbs")

  const images = fs.existsSync(outputDir)
    ? fs
        .readdirSync(outputDir)
        .filter((f) => f.endsWith(".webp"))
        .map((f) => path.join(outputDir, f))
    : []

  const thumbnails = fs.existsSync(thumbDir)
    ? fs
        .readdirSync(thumbDir)
        .filter((f) => f.endsWith(".webp"))
        .map((f) => path.join(thumbDir, f))
    : []

  return { images, thumbnails }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
