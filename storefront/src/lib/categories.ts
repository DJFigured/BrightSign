import { sdk } from "./sdk"
import { unstable_cache } from "next/cache"

export interface NavCategory {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  description?: string | null
  children: NavCategory[]
}

/**
 * Fetch navigation categories from Medusa API.
 * Cached for 5 minutes via unstable_cache.
 */
export const getNavigationCategories = unstable_cache(
  async (): Promise<NavCategory[]> => {
    try {
      const { product_categories } = await sdk.store.category.list({
        fields: "id,name,handle,parent_category_id,description",
        limit: 100,
      }) as { product_categories: Array<{
        id: string
        name: string
        handle: string
        parent_category_id: string | null
        description?: string | null
      }> }

      // Build tree from flat list
      const byId = new Map(product_categories.map(c => [c.id, { ...c, children: [] as NavCategory[] }]))

      const roots: NavCategory[] = []
      for (const cat of byId.values()) {
        if (cat.parent_category_id) {
          const parent = byId.get(cat.parent_category_id)
          if (parent) {
            parent.children.push(cat)
          }
        } else {
          roots.push(cat)
        }
      }

      return roots
    } catch (err) {
      console.error("Failed to fetch navigation categories:", err)
      return []
    }
  },
  ["navigation-categories"],
  { revalidate: 300 } // 5 minutes
)

/**
 * Get structured navigation data for the header/footer.
 * Returns series tree and product lines.
 */
export async function getNavigationData() {
  const roots = await getNavigationCategories()

  const players = roots.find(r => r.handle === "prehravace")
  const accessories = roots.find(r => r.handle === "prislusenstvi")

  // Series: série-6, série-5, série-4 under players
  const series = (players?.children ?? [])
    .filter(c => c.handle.startsWith("serie-"))
    .sort((a, b) => {
      // Sort: 6 → 5 → 4 (newest first)
      const numA = parseInt(a.handle.replace("serie-", ""))
      const numB = parseInt(b.handle.replace("serie-", ""))
      return numB - numA
    })

  // Product lines: hd-prehravace, xd-prehravace etc. under "podle-rady"
  const lineParent = (players?.children ?? []).find(c => c.handle === "podle-rady")
  const lines = lineParent?.children ?? []

  // Desired line order
  const lineOrder = ["ls", "hd", "xd", "xt", "xc", "au"]
  lines.sort((a, b) => {
    const aIdx = lineOrder.indexOf(a.handle.split("-")[0])
    const bIdx = lineOrder.indexOf(b.handle.split("-")[0])
    return aIdx - bIdx
  })

  return {
    players,
    accessories,
    series,
    lines,
  }
}
