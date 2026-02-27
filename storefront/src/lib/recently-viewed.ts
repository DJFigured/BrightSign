const STORAGE_KEY = "brightsign-recently-viewed"
const MAX_ITEMS = 8

export interface RecentlyViewedItem {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

export function addRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined") return
  try {
    const items = getRecentlyViewed()
    const filtered = items.filter((i) => i.id !== item.id)
    const updated = [item, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}
