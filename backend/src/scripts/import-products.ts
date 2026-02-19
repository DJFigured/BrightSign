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
} from "@medusajs/medusa/core-flows"
import * as xlsx from "xlsx"
import * as path from "path"

// CZK → EUR conversion (fixed rate)
const CZK_TO_EUR = 25.5
// CZK → PLN conversion (fixed rate)
const CZK_TO_PLN = 5.8

// Map Shoptet categoryText → Medusa category handle
const CATEGORY_MAP: Record<string, string> = {
  "Videopřehrávače > AU5 Série": "au5-serie",
  "Videopřehrávače > LS5 Série": "ls5-serie",
  "Videopřehrávače > HD5 Série": "hd5-serie",
  "Videopřehrávače > XD5 Série": "xd5-serie",
  "Videopřehrávače > XT5 Série": "xt5-serie",
  "Videopřehrávače > XC5 Série": "xc5-serie",
  "Videopřehrávače > 4. série": "serie-4",
  Příslušenství: "prislusenstvi",
  "Příslušenství > Paměťové karty": "pametove-karty",
  "Příslušenství > Náhradní napájecí adaptéry": "napajeci-adaptery",
}

// Detect accessory subcategory from product name when categoryText is just "Příslušenství"
function resolveAccessoryCategory(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("wi-fi") || lower.includes("bluetooth"))
    return "wifi-moduly"
  if (lower.includes("napájecí") || lower.includes("adaptér"))
    return "napajeci-adaptery"
  if (lower.includes("kabel") || lower.includes("konektor") || lower.includes("gpio"))
    return "kabely-konektory"
  if (lower.includes("sd karta") || lower.includes("micro sd"))
    return "pametove-karty"
  if (lower.includes("panel") || lower.includes("tlačítk") || lower.includes("ovladač"))
    return "ovladaci-panely"
  return "prislusenstvi"
}

function extractProductNumber(name: string, code: string): string {
  // Try to extract model number from name like "BrightSign HD225"
  const match = name.match(
    /(?:BrightSign\s+)?([A-Z]{2,3}\d{3,4})/i
  )
  return match ? match[1].toUpperCase() : code
}

function detectSeries(categoryText: string): string {
  if (categoryText.includes("5 Série") || categoryText.includes("AU5"))
    return "5"
  if (categoryText.includes("4. série") || categoryText.includes("4 Série"))
    return "4"
  return ""
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/brightsign\s*/i, "brightsign-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function importProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("Starting BrightSign product import...")

  // Load Excel
  const excelPath = path.resolve(__dirname, "../../../data/products-3.xlsx")
  const workbook = xlsx.readFile(excelPath)
  const allProducts = xlsx.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  ) as any[]
  const visibleProducts = allProducts.filter(
    (p) => p.productVisibility === "visible"
  )
  logger.info(
    `Found ${visibleProducts.length} visible products out of ${allProducts.length} total.`
  )

  // Load existing categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const categoryByHandle = new Map(categories.map((c: any) => [c.handle, c]))

  // Get shipping profile
  const shippingProfiles =
    await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("No default shipping profile found. Run seed first.")
  }

  // Get sales channel
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "BrightSign Webshop",
  })
  if (!salesChannels.length) {
    throw new Error("No BrightSign Webshop sales channel. Run seed first.")
  }

  // Build product data
  const productInputs = visibleProducts.map((p) => {
    const priceCZK = Number(p.price)
    const priceEUR = Math.round(priceCZK / CZK_TO_EUR)
    const pricePLN = Math.round(priceCZK / CZK_TO_PLN)
    const productNumber = extractProductNumber(p.name, String(p.code))
    const categoryText = String(p.categoryText || "")
    const series = detectSeries(categoryText)

    // Resolve category
    let categoryHandle = CATEGORY_MAP[categoryText]
    if (!categoryHandle && categoryText.startsWith("Příslušenství")) {
      categoryHandle = resolveAccessoryCategory(p.name)
    }
    if (!categoryHandle) {
      categoryHandle = "prislusenstvi"
    }

    const category = categoryByHandle.get(categoryHandle)
    const categoryIds = category ? [category.id] : []

    const handle = generateHandle(p.name)
    const subtitle = p.appendix
      ? stripHtml(String(p.appendix))
      : ""
    const description = p.description
      ? String(p.description)
      : p.shortDescription
        ? String(p.shortDescription)
        : ""

    return {
      title: String(p.name),
      handle,
      subtitle,
      description,
      status: ProductStatus.PUBLISHED,
      category_ids: categoryIds,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        productNumber,
        series,
        shoptetCode: String(p.code),
        warranty: "24 měsíců",
      },
      images: p.image
        ? [{ url: String(p.image) }]
        : [],
      options: [
        {
          title: "Default",
          values: ["Standard"],
        },
      ],
      variants: [
        {
          title: "Standard",
          sku: `BS-${productNumber}`,
          manage_inventory: true,
          options: {
            Default: "Standard",
          },
          prices: [
            { currency_code: "czk", amount: priceCZK },
            { currency_code: "eur", amount: priceEUR },
            { currency_code: "pln", amount: pricePLN },
          ],
        },
      ],
      sales_channels: [{ id: salesChannels[0].id }],
    }
  })

  // Create products in batches of 10
  const batchSize = 10
  for (let i = 0; i < productInputs.length; i += batchSize) {
    const batch = productInputs.slice(i, i + batchSize)
    logger.info(
      `Creating products ${i + 1}-${Math.min(i + batchSize, productInputs.length)}...`
    )
    await createProductsWorkflow(container).run({
      input: { products: batch },
    })
  }

  logger.info("Products created. Setting up inventory levels...")

  // Get stock location
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  const stockLocation = stockLocations[0]

  // Set inventory levels for all items
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.map(
    (item: any) => ({
      location_id: stockLocation.id,
      stocked_quantity: 10,
      inventory_item_id: item.id,
    })
  )

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    })
  }

  logger.info("BrightSign product import completed!")
  logger.info(`  - ${productInputs.length} products imported`)
  logger.info(`  - ${inventoryLevels.length} inventory levels set`)
}
