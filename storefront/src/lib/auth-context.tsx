"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { sdk } from "./sdk"

interface Customer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  has_account: boolean
  metadata?: Record<string, unknown>
}

interface AuthContextValue {
  customer: Customer | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshCustomer = useCallback(async () => {
    try {
      const { customer } = await sdk.store.customer.retrieve() as { customer: Customer }
      setCustomer(customer)
    } catch {
      setCustomer(null)
    }
  }, [])

  useEffect(() => {
    refreshCustomer().finally(() => setLoading(false))
  }, [refreshCustomer])

  const login = useCallback(async (email: string, password: string) => {
    await sdk.auth.login("customer", "emailpass", { email, password })
    await refreshCustomer()
  }, [refreshCustomer])

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    await sdk.auth.register("customer", "emailpass", { email, password })
    await sdk.store.customer.create({
      email,
      first_name: firstName,
      last_name: lastName,
    })
    await refreshCustomer()
  }, [refreshCustomer])

  const logout = useCallback(async () => {
    try {
      await sdk.auth.logout()
    } catch {
      // Ignore errors
    }
    setCustomer(null)
  }, [])

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
