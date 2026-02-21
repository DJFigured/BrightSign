import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Creates all product categories: Series (4/5/6) + Product Lines (HD/XD/XT/XC/LS/AU).
 * Idempotent — skips existing categories.
 * Run: npx medusa exec ./src/scripts/product-agent/add-categories.ts
 */
export default async function addAllCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Adding all product categories...")

  // Load existing categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const byHandle = new Map(categories.map((c: any) => [c.handle, c]))

  async function ensureCategory(
    name: string,
    handle: string,
    parentId: string | null,
    description?: string,
  ): Promise<string> {
    const existing = byHandle.get(handle)
    if (existing) {
      logger.info(`  ✓ ${handle} already exists`)
      return existing.id
    }
    const { result: [created] } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [{
          name,
          handle,
          is_active: true,
          is_internal: false,
          parent_category_id: parentId,
          description: description || undefined,
        }],
      },
    })
    byHandle.set(handle, created)
    logger.info(`  + Created: ${name} (${handle})`)
    return created.id
  }

  // ── Top-level "Přehrávače" (should exist from seed) ──
  const playersId = byHandle.get("prehravace")?.id
  if (!playersId) {
    throw new Error("Parent category 'Přehrávače' (prehravace) not found. Run seed first.")
  }

  // ── Series categories under Přehrávače ──
  logger.info("\n--- Série categories ---")
  const serie6Id = await ensureCategory("Série 6", "serie-6", playersId, "BrightSign Série 6 – nejnovější generace s NPU a 10-bit HDR")
  const serie5Id = await ensureCategory("Série 5", "serie-5", playersId, "BrightSign Série 5 – aktuální generace s 5letou zárukou")
  const serie4Id = await ensureCategory("Série 4", "serie-4", playersId, "BrightSign Série 4 – předchozí generace za doprodejové ceny")

  // ── S6 family subcategories ──
  logger.info("\n--- S6 family categories ---")
  const s6Families = [
    { name: "HD6 Série", handle: "hd6-serie" },
    { name: "XD6 Série", handle: "xd6-serie" },
    { name: "XT6 Série", handle: "xt6-serie" },
    { name: "XC6 Série", handle: "xc6-serie" },
    { name: "LS6 Série", handle: "ls6-serie" },
    { name: "AU6 Série", handle: "au6-serie" },
  ]
  for (const f of s6Families) {
    await ensureCategory(f.name, f.handle, serie6Id)
  }

  // ── S5 family subcategories ──
  logger.info("\n--- S5 family categories ---")
  const s5Families = [
    { name: "HD5 Série", handle: "hd5-serie" },
    { name: "XD5 Série", handle: "xd5-serie" },
    { name: "XT5 Série", handle: "xt5-serie" },
    { name: "XC5 Série", handle: "xc5-serie" },
    { name: "LS5 Série", handle: "ls5-serie" },
    { name: "AU5 Série", handle: "au5-serie" },
  ]
  for (const f of s5Families) {
    await ensureCategory(f.name, f.handle, serie5Id)
  }

  // ── S4 family subcategories ──
  logger.info("\n--- S4 family categories ---")
  const s4Families = [
    { name: "HD4 Série", handle: "hd4-serie" },
    { name: "XD4 Série", handle: "xd4-serie" },
    { name: "XT4 Série", handle: "xt4-serie" },
    { name: "LS4 Série", handle: "ls4-serie" },
  ]
  for (const f of s4Families) {
    await ensureCategory(f.name, f.handle, serie4Id)
  }

  // ── Product Line categories (top-level, under Přehrávače) ──
  logger.info("\n--- Product Line categories ---")
  const lineParentId = await ensureCategory("Podle řady", "podle-rady", playersId, "Třídění přehrávačů podle produktové řady")

  const lines = [
    { name: "HD Přehrávače", handle: "hd-prehravace", desc: "Entry 4K – Vstupní 4K přehrávače pro základní digital signage" },
    { name: "XD Přehrávače", handle: "xd-prehravace", desc: "Performance 4K – Výkonné 4K přehrávače s pokročilou grafikou" },
    { name: "XT Přehrávače", handle: "xt-prehravace", desc: "Enterprise – Prémiové přehrávače s duálním výstupem a PoE+" },
    { name: "XC Přehrávače", handle: "xc-prehravace", desc: "Video Wall – Přehrávače pro video stěny a multi-display instalace" },
    { name: "LS Přehrávače", handle: "ls-prehravace", desc: "Basic – Základní Full HD přehrávače za nejnižší cenu" },
    { name: "AU Přehrávače", handle: "au-prehravace", desc: "Audio – Specializované audio přehrávače pro ozvučení" },
  ]
  for (const l of lines) {
    await ensureCategory(l.name, l.handle, lineParentId, l.desc)
  }

  logger.info("\nAll categories setup complete!")
}
