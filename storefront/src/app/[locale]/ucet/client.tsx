"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/medusa-helpers"
import { Loader2, LogOut, Package, User, Pencil, Check } from "lucide-react"

interface Order {
  id: string
  display_id: number
  status: string
  created_at: string
  total: number
  currency_code: string
  items: Array<{ title: string; quantity: number }>
}

export function AccountPageClient() {
  const t = useTranslations("account")
  const locale = useLocale()
  const { customer, loading: authLoading, logout, refreshCustomer } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editPhone, setEditPhone] = useState("")

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/prihlaseni")
    }
  }, [authLoading, customer, router])

  useEffect(() => {
    if (customer) {
      setOrdersLoading(true)
      setOrdersError(false)
      sdk.store.order
        .list({ limit: 10 })
        .then(({ orders }: { orders: Order[] }) => setOrders(orders ?? []))
        .catch(() => setOrdersError(true))
        .finally(() => setOrdersLoading(false))
    }
  }, [customer])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) return null

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  function startEditing() {
    setEditFirstName(customer?.first_name ?? "")
    setEditLastName(customer?.last_name ?? "")
    setEditPhone(customer?.phone ?? "")
    setEditing(true)
    setProfileSuccess(false)
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await sdk.store.customer.update({
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone || undefined,
      })
      await refreshCustomer()
      setEditing(false)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch {
      // keep form open on error
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("profile")}
              </span>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {editing ? (
              <form onSubmit={handleProfileSave} className="space-y-3">
                <div>
                  <Label htmlFor="editFirstName">{t("firstName")}</Label>
                  <Input
                    id="editFirstName"
                    autoComplete="given-name"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">{t("lastName")}</Label>
                  <Input
                    id="editLastName"
                    autoComplete="family-name"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">{t("phone")}</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    autoComplete="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={profileSaving} className="bg-brand-accent hover:bg-brand-accent-dark text-white">
                    {profileSaving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                    {t("save")}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="font-medium">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="text-muted-foreground">{customer.email}</p>
                {customer.phone && (
                  <p className="text-muted-foreground">{customer.phone}</p>
                )}
                {profileSuccess && (
                  <p className="mt-2 text-xs text-green-600" role="status">{t("profileSaved")}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                {t("orders")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : ordersError ? (
                <p className="py-8 text-center text-sm text-destructive" role="alert">
                  {t("ordersError")}
                </p>
              ) : orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("noOrdersYet")}
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/ucet/objednavka/${order.id}`}
                      className="block rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm font-medium">
                            #{order.display_id}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(locale)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{order.status}</Badge>
                          <span className="font-semibold">
                            {formatPrice(order.total, order.currency_code?.toUpperCase() ?? "CZK")}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.items?.map((i) => `${i.quantity}× ${i.title}`).join(", ")}
                      </p>
                      <Separator className="mt-3" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
