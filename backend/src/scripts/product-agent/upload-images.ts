import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

/**
 * Upload images from local storage into Medusa products.
 * Run: npx medusa exec ./src/scripts/product-agent/upload-images.ts
 *
 * Images must be in: tools/product-agent/data/images/{familyCode}/
 * Products must already exist in Medusa (run sync-products first).
 *
 * Env vars:
 *   UPLOAD_OPTIMIZED=1 — read from data/images-optimized/ (WebP) instead of data/images/
 *   UPLOAD_OVERWRITE=1 — re-upload even if product already has images
 */
export default async function uploadImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileModuleService = container.resolve(Modules.FILE)

  const useOptimized = process.env.UPLOAD_OPTIMIZED === "1"
  const overwrite = process.env.UPLOAD_OVERWRITE === "1"

  const imageSubdir = useOptimized ? "images-optimized" : "images"
  logger.info(`Starting image upload to Medusa (source: ${imageSubdir}, overwrite: ${overwrite})...`)

  const imagesBaseDir = path.resolve(
    __dirname,
    `../../../../tools/product-agent/data/${imageSubdir}`
  )

  if (!fs.existsSync(imagesBaseDir)) {
    throw new Error(
      `Images directory not found: ${imagesBaseDir}. Run 'npx tsx src/cli.ts images' first.`
    )
  }

  // Load generated content to map familyCode → modelNumbers
  const generatedPath = path.resolve(
    __dirname,
    "../../../../tools/product-agent/data/generated/generated-content.json"
  )
  if (!fs.existsSync(generatedPath)) {
    throw new Error("Generated content not found. Run generate + sync first.")
  }

  const generated: { modelNumber: string; familyCode: string }[] = JSON.parse(
    fs.readFileSync(generatedPath, "utf-8")
  )

  // Get existing products
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "images.*", "thumbnail"],
  })

  const productByHandle = new Map(
    products.map((p: any) => [p.handle, p])
  )

  let uploaded = 0
  let skipped = 0

  // Group models by family for shared images
  const familyModels = new Map<string, string[]>()
  for (const g of generated) {
    const existing = familyModels.get(g.familyCode) || []
    existing.push(g.modelNumber)
    familyModels.set(g.familyCode, existing)
  }

  for (const [familyCode, modelNumbers] of familyModels) {
    const imageDir = path.join(imagesBaseDir, familyCode)
    if (!fs.existsSync(imageDir)) {
      logger.warn(`  No images directory for ${familyCode}, skipping.`)
      continue
    }

    // Read all image files in the family directory (skip thumbs/ subdirectory)
    const imageFiles = fs
      .readdirSync(imageDir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f) && f !== "thumbs")
      .sort()

    if (!imageFiles.length) {
      logger.warn(`  No image files in ${familyCode}/, skipping.`)
      continue
    }

    // Upload each image to Medusa file storage
    const uploadedUrls: string[] = []
    for (const filename of imageFiles) {
      const filePath = path.join(imageDir, filename)
      const fileContent = fs.readFileSync(filePath)
      const mimeType = filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg"

      try {
        const [uploadResult] = await fileModuleService.createFiles([{
          filename,
          mimeType,
          content: fileContent.toString("base64"),
          access: "public",
        }])
        uploadedUrls.push(uploadResult.url)
      } catch (err) {
        logger.error(`  Failed to upload ${filename}: ${(err as Error).message}`)
      }
    }

    if (!uploadedUrls.length) continue

    // Assign images to all models in this family
    for (const modelNumber of modelNumbers) {
      const handle = `brightsign-${modelNumber.toLowerCase()}`
      const product = productByHandle.get(handle)

      if (!product) {
        logger.warn(`  Product ${handle} not found in Medusa, skipping.`)
        skipped++
        continue
      }

      // Skip if product already has images (unless overwrite)
      if (!overwrite && (product.images?.length > 0 || product.thumbnail)) {
        logger.info(`  ${handle}: already has images, skipping.`)
        skipped++
        continue
      }

      // Use first "product-" image as thumbnail, rest as gallery
      const thumbnailUrl =
        uploadedUrls.find((u) => u.includes("product-")) || uploadedUrls[0]

      try {
        await updateProductsWorkflow(container).run({
          input: {
            selector: { id: product.id },
            update: {
              thumbnail: thumbnailUrl,
              images: uploadedUrls.map((url) => ({ url })),
            },
          },
        })
        logger.info(`  ${handle}: ${uploadedUrls.length} images assigned.`)
        uploaded++
      } catch (err) {
        logger.error(`  Failed to update ${handle}: ${(err as Error).message}`)
      }
    }
  }

  logger.info("\nImage upload complete!")
  logger.info(`  Updated: ${uploaded} products`)
  logger.info(`  Skipped: ${skipped} products`)
}
