import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Audit script: lists all products with their status.
 * Run: npx medusa exec ./src/scripts/product-agent/list-products.ts
 */
export default async function listProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("=== BrightSign Product Audit ===\n")

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "status",
      "description",
      "subtitle",
      "thumbnail",
      "metadata",
      "images.*",
      "variants.*",
      "variants.prices.*",
      "categories.*",
    ],
  })

  logger.info(`Total products: ${products.length}\n`)

  // Group by series
  const bySeries = new Map<string, any[]>()
  const noSeries: any[] = []

  for (const product of products) {
    const series = (product as any).metadata?.series
    if (series) {
      const list = bySeries.get(series) || []
      list.push(product)
      bySeries.set(series, list)
    } else {
      noSeries.push(product)
    }
  }

  for (const [series, prods] of [...bySeries].sort()) {
    logger.info(`── Série ${series} (${prods.length} products) ──`)
    for (const p of prods) {
      const meta = p.metadata || {}
      const hasDesc = p.description && p.description.length > 50
      const hasImages = (p.images?.length || 0) > 0
      const hasThumbnail = !!p.thumbnail
      const hasTranslations = !!meta.translations && Object.keys(meta.translations).length > 0
      const translationLocales = meta.translations
        ? Object.keys(meta.translations).join(",")
        : ""
      const prices = p.variants?.[0]?.prices || []
      const czkPrice = prices.find((pr: any) => pr.currency_code === "czk")
      const priceStr = czkPrice ? `${czkPrice.amount} CZK` : "NO PRICE"
      const categories = (p.categories || []).map((c: any) => c.handle).join(", ")

      const flags = [
        p.status === "published" ? "PUB" : "DRF",
        hasDesc ? "DESC" : "no-desc",
        hasImages ? `${p.images.length}img` : "no-img",
        hasThumbnail ? "thumb" : "no-thumb",
        hasTranslations ? `i18n:${translationLocales}` : "no-i18n",
      ].join(" | ")

      logger.info(
        `  ${meta.productNumber || p.handle} [${flags}] ${priceStr} cat:[${categories}]`
      )
    }
    logger.info("")
  }

  if (noSeries.length) {
    logger.info(`── No series (${noSeries.length} products) ──`)
    for (const p of noSeries) {
      const hasDesc = p.description && p.description.length > 50
      const hasImages = (p.images?.length || 0) > 0
      logger.info(
        `  ${p.handle} [${p.status}] ${hasDesc ? "DESC" : "no-desc"} ${hasImages ? `${p.images.length}img` : "no-img"}`
      )
    }
    logger.info("")
  }

  // Summary
  const withDesc = products.filter(
    (p: any) => p.description && p.description.length > 50
  ).length
  const withImages = products.filter(
    (p: any) => (p.images?.length || 0) > 0
  ).length
  const withTranslations = products.filter(
    (p: any) => p.metadata?.translations && Object.keys(p.metadata.translations).length > 0
  ).length
  const published = products.filter(
    (p: any) => p.status === "published"
  ).length

  logger.info("=== Summary ===")
  logger.info(`  Total:        ${products.length}`)
  logger.info(`  Published:    ${published}`)
  logger.info(`  With desc:    ${withDesc}`)
  logger.info(`  With images:  ${withImages}`)
  logger.info(`  With i18n:    ${withTranslations}`)
}
