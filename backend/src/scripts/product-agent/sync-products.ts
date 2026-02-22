import {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"

// Currency conversion rates
const CZK_TO_EUR = 25.5
const CZK_TO_PLN = 5.8

// Family code → series category handle mapping
const FAMILY_CATEGORY_MAP: Record<string, string> = {
  au6: "au6-serie", au5: "au5-serie", au4: "au4-serie",
  ls6: "ls6-serie", ls5: "ls5-serie", ls4: "ls4-serie",
  hd6: "hd6-serie", hd5: "hd5-serie", hd4: "hd4-serie",
  xd6: "xd6-serie", xd5: "xd5-serie", xd4: "xd4-serie",
  xt6: "xt6-serie", xt5: "xt5-serie", xt4: "xt4-serie",
  xc6: "xc6-serie", xc5: "xc5-serie",
}

// Family code prefix → product line category handle
const LINE_CATEGORY_MAP: Record<string, string> = {
  au: "au-prehravace",
  ls: "ls-prehravace",
  hd: "hd-prehravace",
  xd: "xd-prehravace",
  xt: "xt-prehravace",
  xc: "xc-prehravace",
}

// Datasheet URLs per family (from scraped brightsign.biz data)
const FAMILY_DATASHEET_MAP: Record<string, string> = {
  hd6: "https://www.brightsign.biz/wp-content/uploads/2025/06/HD6-datasheet-20250604.pdf",
  xd6: "https://www.brightsign.biz/wp-content/uploads/2025/06/XD6-datasheet-20250604.pdf",
  hd5: "https://www.brightsign.biz/wp-content/uploads/2024/06/HD5-datasheet-2024.pdf",
  xd5: "https://www.brightsign.biz/wp-content/uploads/2024/06/XD5-datasheet-2024.pdf",
  xt5: "https://www.brightsign.biz/wp-content/uploads/2024/06/XT5-datasheet-2024.pdf",
  xc5: "https://www.brightsign.biz/wp-content/uploads/2024/07/XC5-datasheet-07182024-Final-1.pdf",
  ls5: "https://www.brightsign.biz/wp-content/uploads/2024/06/LS5-datasheet-2024.pdf",
  au5: "https://www.brightsign.biz/wp-content/uploads/2024/06/AU5-datasheet-2024.pdf",
}

interface GeneratedContent {
  modelNumber: string
  familyCode: string
  series: string
  title: string
  subtitle: string
  description: string
  seoTitle: string
  seoDescription: string
  specs: {
    dimensions: string | null
    weight: string | null
    warranty: string | null
    raw: Record<string, string>
  }
}

interface PriceOverride {
  modelNumber: string
  priceCZK: number
  priceEUR?: number
  pricePLN?: number
}

/**
 * Sync products from generated JSON into Medusa.
 * Run: npx medusa exec ./src/scripts/product-agent/sync-products.ts
 *
 * Reads from:
 *   tools/product-agent/data/generated/generated-content.json
 *   data/price-overrides.json (optional)
 *
 * Env vars:
 *   SYNC_FORCE_RECREATE=1 — delete + recreate existing products (useful when
 *     updateProductsWorkflow can't set prices on existing draft products)
 */
export default async function syncProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  const forceRecreate = process.env.SYNC_FORCE_RECREATE === "1"

  logger.info(`Starting product sync from generated content (forceRecreate: ${forceRecreate})...`)

  // Load generated content
  const generatedPath = path.resolve(
    __dirname,
    "../../../../tools/product-agent/data/generated/generated-content.json"
  )
  if (!fs.existsSync(generatedPath)) {
    throw new Error(
      `Generated content not found at ${generatedPath}. Run 'npx tsx src/cli.ts generate' in tools/product-agent/ first.`
    )
  }

  const generated: GeneratedContent[] = JSON.parse(
    fs.readFileSync(generatedPath, "utf-8")
  )
  logger.info(`Loaded ${generated.length} generated product descriptions.`)

  // Load price overrides (optional)
  const pricesPath = path.resolve(__dirname, "../../../../data/price-overrides.json")
  let priceOverrides: PriceOverride[] = []
  if (fs.existsSync(pricesPath)) {
    priceOverrides = JSON.parse(fs.readFileSync(pricesPath, "utf-8"))
    logger.info(`Loaded ${priceOverrides.length} price overrides.`)
  } else {
    logger.warn("No price-overrides.json found. Products will have no prices.")
  }
  const priceMap = new Map(priceOverrides.map((p) => [p.modelNumber, p]))

  // Load translations (optional)
  const translationsPath = path.resolve(
    __dirname,
    "../../../../tools/product-agent/data/generated/translations.json"
  )
  let translations: Record<string, Record<string, { title: string; subtitle: string; description: string; seoTitle: string; seoDescription: string }>> = {}
  if (fs.existsSync(translationsPath)) {
    translations = JSON.parse(fs.readFileSync(translationsPath, "utf-8"))
    logger.info(`Loaded translations for ${Object.keys(translations).length} models.`)
  }

  // Get categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const categoryByHandle = new Map(categories.map((c: any) => [c.handle, c]))

  // Get shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("No default shipping profile found. Run seed first.")
  }

  // Get sales channel
  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "BrightSign Webshop",
  })
  if (!salesChannels.length) {
    throw new Error("No BrightSign Webshop sales channel. Run seed first.")
  }

  // Get existing products to check for updates
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  })
  const existingByHandle = new Map(
    existingProducts.map((p: any) => [p.handle, p])
  )

  // Build product inputs
  const toCreate: any[] = []
  const toUpdate: any[] = []

  for (const content of generated) {
    const handle = `brightsign-${content.modelNumber.toLowerCase()}`

    // Dual category assignment: series family + product line
    const categoryIds: string[] = []
    const seriesCatHandle = FAMILY_CATEGORY_MAP[content.familyCode]
    const seriesCat = seriesCatHandle ? categoryByHandle.get(seriesCatHandle) : null
    if (seriesCat) categoryIds.push(seriesCat.id)

    const linePrefix = content.familyCode.replace(/[0-9]/g, "")
    const lineCatHandle = LINE_CATEGORY_MAP[linePrefix]
    const lineCat = lineCatHandle ? categoryByHandle.get(lineCatHandle) : null
    if (lineCat) categoryIds.push(lineCat.id)

    const price = priceMap.get(content.modelNumber)
    const priceCZK = price?.priceCZK ?? 0
    const priceEUR = price?.priceEUR ?? (priceCZK ? Math.round(priceCZK / CZK_TO_EUR) : 0)
    const pricePLN = price?.pricePLN ?? (priceCZK ? Math.round(priceCZK / CZK_TO_PLN) : 0)

    const modelTranslations = translations[content.modelNumber] || {}

    const isClearance = content.series === "4"
    const datasheetUrl = FAMILY_DATASHEET_MAP[content.familyCode] || null
    const metadata: Record<string, unknown> = {
      productNumber: content.modelNumber,
      series: content.series,
      familyCode: content.familyCode,
      familyName: content.familyCode.toUpperCase(),
      lineCode: linePrefix.toUpperCase(),
      clearance: isClearance ? "true" : "false",
      warranty: content.specs.warranty || (content.series === "6" ? "5 let" : content.series === "5" ? "3 roky" : "2 roky"),
      datasheetUrl,
      specs: content.specs.raw || {},
      seo: {
        title: content.seoTitle,
        description: content.seoDescription,
      },
      translations: modelTranslations,
    }

    const existing = existingByHandle.get(handle)

    if (existing && forceRecreate) {
      // Force-recreate: delete existing product so it can be recreated with prices
      logger.info(`  Force-recreate: deleting ${handle} (${existing.id})...`)
      await deleteProductsWorkflow(container).run({
        input: { ids: [existing.id] },
      })
      // Fall through to create path below
    }

    if (existing && !forceRecreate) {
      toUpdate.push({
        id: existing.id,
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        status: priceCZK ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        metadata,
        category_ids: categoryIds,
        priceCZK,
        priceEUR,
        pricePLN,
      })
    } else {
      const prices: { currency_code: string; amount: number }[] = []
      if (priceCZK) {
        // Medusa stores prices in minor units (haléře/cents/grosze)
        prices.push(
          { currency_code: "czk", amount: priceCZK * 100 },
          { currency_code: "eur", amount: priceEUR * 100 },
          { currency_code: "pln", amount: pricePLN * 100 }
        )
      }

      toCreate.push({
        title: content.title,
        handle,
        subtitle: content.subtitle,
        description: content.description,
        status: priceCZK ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        category_ids: categoryIds,
        shipping_profile_id: shippingProfile.id,
        metadata,
        options: [{ title: "Default", values: ["Standard"] }],
        variants: [
          {
            title: "Standard",
            sku: `BS-${content.modelNumber}`,
            manage_inventory: true,
            options: { Default: "Standard" },
            prices,
          },
        ],
        sales_channels: [{ id: salesChannels[0].id }],
      })
    }
  }

  // Create new products in batches
  if (toCreate.length) {
    logger.info(`Creating ${toCreate.length} new products...`)
    const batchSize = 5
    for (let i = 0; i < toCreate.length; i += batchSize) {
      const batch = toCreate.slice(i, i + batchSize)
      logger.info(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.map((p: any) => p.handle).join(", ")}`)
      await createProductsWorkflow(container).run({
        input: { products: batch },
      })
    }
  }

  // Update existing products (title, description, metadata, status)
  // NOTE: updateProductsWorkflow does NOT support category_ids or price changes
  // For price/category changes, use SYNC_FORCE_RECREATE=1
  if (toUpdate.length) {
    logger.info(`Updating ${toUpdate.length} existing products...`)
    const needsRecreateForPrices: string[] = []
    for (const product of toUpdate) {
      logger.info(`  Updating: ${product.id}`)
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            status: product.status,
            metadata: product.metadata,
          },
        },
      })
      if (product.priceCZK) {
        needsRecreateForPrices.push(product.id)
      }
    }
    if (needsRecreateForPrices.length) {
      logger.warn(`  ${needsRecreateForPrices.length} products may need SYNC_FORCE_RECREATE=1 to update prices/categories.`)
    }
  }

  // Set up inventory levels for newly created products
  if (toCreate.length) {
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
    })
    const stockLocation = stockLocations[0]

    if (stockLocation) {
      const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
        filters: {
          // Only items without an existing level
        },
      })

      // Check which items already have levels
      const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["inventory_item_id"],
      })
      const hasLevel = new Set(existingLevels.map((l: any) => l.inventory_item_id))

      const newLevels: CreateInventoryLevelInput[] = inventoryItems
        .filter((item: any) => !hasLevel.has(item.id))
        .map((item: any) => ({
          location_id: stockLocation.id,
          stocked_quantity: 0,
          inventory_item_id: item.id,
        }))

      if (newLevels.length) {
        await createInventoryLevelsWorkflow(container).run({
          input: { inventory_levels: newLevels },
        })
        logger.info(`  Set ${newLevels.length} inventory levels (qty=0).`)
      }
    }
  }

  logger.info("\nSync complete!")
  logger.info(`  Created: ${toCreate.length}`)
  logger.info(`  Updated: ${toUpdate.length}`)
  logger.info(`  Skipped: ${generated.length - toCreate.length - toUpdate.length}`)
}
