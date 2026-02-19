"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { sdk } from "./sdk"
import { useLocale } from "next-intl"
import { regionMap } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { getRegionId, SALES_CHANNEL_ID } from "@/lib/medusa-helpers"

interface CartItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  variant_id: string
  thumbnail?: string | null
  product_title?: string
  variant_title?: string
}

interface Cart {
  id: string
  items: CartItem[]
  total?: number
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  region_id?: string
  currency_code?: string
  email?: string
  shipping_address?: Record<string, unknown>
  billing_address?: Record<string, unknown>
  shipping_methods?: Array<Record<string, unknown>>
  payment_collection?: Record<string, unknown>
  [key: string]: unknown
}

interface CartContextValue {
  cart: Cart | null
  loading: boolean
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  refreshCart: () => Promise<void>
  cartId: string | null
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_ID_KEY = "brightsign_cart_id"

function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

function setStoredCartId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_ID_KEY, id)
}

function clearStoredCartId() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_ID_KEY)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale
  const regionCode = regionMap[locale]
  const regionId = getRegionId(regionCode)
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartId, setCartId] = useState<string | null>(null)

  const fetchCart = useCallback(async (id: string) => {
    try {
      const { cart } = await sdk.store.cart.retrieve(id) as { cart: Cart }
      setCart(cart)
      return cart
    } catch {
      clearStoredCartId()
      setCartId(null)
      setCart(null)
      return null
    }
  }, [])

  const createCart = useCallback(async () => {
    try {
      const { cart } = await sdk.store.cart.create({ region_id: regionId, sales_channel_id: SALES_CHANNEL_ID }) as { cart: Cart }
      setStoredCartId(cart.id)
      setCartId(cart.id)
      setCart(cart)
      return cart
    } catch (e) {
      console.error("Failed to create cart:", e)
      return null
    }
  }, [regionId])

  const getOrCreateCart = useCallback(async () => {
    const storedId = getStoredCartId()
    if (storedId) {
      const existing = await fetchCart(storedId)
      if (existing) {
        setCartId(storedId)
        return existing
      }
    }
    return createCart()
  }, [fetchCart, createCart])

  useEffect(() => {
    getOrCreateCart().finally(() => setLoading(false))
  }, [getOrCreateCart])

  const refreshCart = useCallback(async () => {
    if (cartId) {
      await fetchCart(cartId)
    }
  }, [cartId, fetchCart])

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    let id = cartId
    if (!id) {
      const newCart = await createCart()
      if (!newCart) return
      id = newCart.id
    }
    const { cart: updated } = await sdk.store.cart.createLineItem(id, {
      variant_id: variantId,
      quantity,
    }) as { cart: Cart }
    setCart(updated)
  }, [cartId, createCart])

  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    if (!cartId) return
    const { cart: updated } = await sdk.store.cart.updateLineItem(cartId, lineItemId, {
      quantity,
    }) as { cart: Cart }
    setCart(updated)
  }, [cartId])

  const removeItem = useCallback(async (lineItemId: string) => {
    if (!cartId) return
    const { cart: updated } = await sdk.store.cart.deleteLineItem(cartId, lineItemId) as { cart: Cart }
    setCart(updated)
  }, [cartId])

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem, refreshCart, cartId }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
