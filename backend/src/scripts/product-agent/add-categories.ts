import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Creates Series 6 product categories in Medusa.
 * Run: npx medusa exec ./src/scripts/product-agent/add-categories.ts
 */
export default async function addSeries6Categories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Adding Series 6 categories...")

  // Find parent "Přehrávače" category
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })

  const catPlayers = categories.find((c: any) => c.handle === "prehravace")
  if (!catPlayers) {
    throw new Error("Parent category 'Přehrávače' (prehravace) not found. Run seed first.")
  }

  // Check if Série 6 already exists
  const existingSerie6 = categories.find((c: any) => c.handle === "serie-6")
  let serie6Id: string

  if (existingSerie6) {
    logger.info("Série 6 category already exists, skipping creation.")
    serie6Id = existingSerie6.id
  } else {
    const { result: [serie6] } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Série 6",
            handle: "serie-6",
            is_active: true,
            is_internal: false,
            parent_category_id: catPlayers.id,
          },
        ],
      },
    })
    serie6Id = serie6.id
    logger.info(`Created: Série 6 (${serie6Id})`)
  }

  // S6 family subcategories
  const s6Families = [
    { name: "AU6 Série", handle: "au6-serie" },
    { name: "LS6 Série", handle: "ls6-serie" },
    { name: "HD6 Série", handle: "hd6-serie" },
    { name: "XD6 Série", handle: "xd6-serie" },
    { name: "XT6 Série", handle: "xt6-serie" },
    { name: "XC6 Série", handle: "xc6-serie" },
  ]

  const toCreate = s6Families.filter(
    (f) => !categories.find((c: any) => c.handle === f.handle)
  )

  if (toCreate.length === 0) {
    logger.info("All S6 family categories already exist.")
    return
  }

  const { result: created } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: toCreate.map((f) => ({
        name: f.name,
        handle: f.handle,
        is_active: true,
        is_internal: false,
        parent_category_id: serie6Id,
      })),
    },
  })

  logger.info(`Created ${created.length} S6 family categories: ${created.map((c) => c.name).join(", ")}`)
  logger.info("Series 6 categories setup complete!")
}
