"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface CompareItem {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
}

interface CompareContextValue {
  items: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (id: string) => void
  isInCompare: (id: string) => boolean
  toggleItem: (item: CompareItem) => void
  clear: () => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

const STORAGE_KEY = "brightsign-compare"
const MAX_ITEMS = 4

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) return prev
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const isInCompare = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  )

  const toggleItem = useCallback(
    (item: CompareItem) => {
      if (isInCompare(item.id)) {
        removeItem(item.id)
      } else {
        addItem(item)
      }
    },
    [isInCompare, removeItem, addItem]
  )

  const clear = useCallback(() => setItems([]), [])

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, isInCompare, toggleItem, clear }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("useCompare must be used within CompareProvider")
  return ctx
}
