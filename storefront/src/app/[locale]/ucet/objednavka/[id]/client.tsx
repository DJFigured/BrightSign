"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/medusa-helpers"
import { Loader2, ArrowLeft, Package, MapPin, ShoppingBag, Truck, FileText, Download } from "lucide-react"

interface OrderDetail {
  id: string
  display_id: number
  status: string
  fulfillment_status: string
  payment_status: string
  created_at: string
  email: string
  currency_code: string
  subtotal: number
  shipping_total: number
  tax_total: number
  total: number
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    thumbnail?: string | null
  }>
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    city?: string
    postal_code?: string
    country_code?: string
    phone?: string
  } | null
  shipping_methods?: Array<{
    name: string
    amount: number
  }> | null
  fulfillments?: Array<{
    tracking_numbers?: string[]
    tracking_links?: Array<{ url: string }>
  }> | null
}

interface Invoice {
  id: string
  type: string
  number: string
  status: string
  issued_at: string
  due_at?: string
  paid_at?: string
  currency_code: string
  total: number
  pdf_url?: string
}

export function OrderDetailPageClient() {
  const t = useTranslations("checkout")
  const tAccount = useTranslations("account")
  const tCart = useTranslations("cart")
  const locale = useLocale()
  const { customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/prihlaseni")
    }
  }, [authLoading, customer, router])

  useEffect(() => {
    if (customer && orderId) {
      setLoading(true)
      setError(false)
      sdk.store.order
        .retrieve(orderId)
        .then((res) => {
          setOrder((res as { order: OrderDetail }).order ?? res as unknown as OrderDetail)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))

      // Fetch invoices
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      fetch(`${backendUrl}/store/orders/${orderId}/invoices`, {
        credentials: "include",
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.invoices) setInvoices(data.invoices)
        })
        .catch(() => {}) // Silently ignore — invoices may not be available yet
    }
  }, [customer, orderId])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-destructive" role="alert">{tAccount("ordersError")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/ucet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToOrders")}
          </Link>
        </Button>
      </div>
    )
  }

  if (!customer || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{tAccount("noOrders")}</p>
      </div>
    )
  }

  const currency = order.currency_code?.toUpperCase() ?? "CZK"

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "captured":
      case "fulfilled":
        return "bg-green-100 text-green-800"
      case "pending":
      case "not_fulfilled":
      case "awaiting":
        return "bg-yellow-100 text-yellow-800"
      case "canceled":
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const trackingNumbers = order.fulfillments?.flatMap((f) => f.tracking_numbers ?? []) ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/ucet">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToOrders")}
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {t("orderDetail")} #{order.display_id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge className={statusColor(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Order status overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground">{t("orderStatusLabel")}</p>
              <Badge className={`mt-1 ${statusColor(order.status)}`}>{order.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground">{t("paymentMethod")}</p>
              <Badge className={`mt-1 ${statusColor(order.payment_status)}`}>
                {order.payment_status === "captured" ? t("paid") : t("pending")}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground">{t("fulfillment")}</p>
              <Badge className={`mt-1 ${statusColor(order.fulfillment_status)}`}>
                {order.fulfillment_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4" />
              {t("orderItems")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.thumbnail && (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="rounded border object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}× {formatPrice(item.unit_price, currency)}
                    </p>
                  </div>
                </div>
                <span className="font-medium">
                  {formatPrice(item.unit_price * item.quantity, currency)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCart("subtotal")}</span>
              <span>{formatPrice(order.subtotal, currency)}</span>
            </div>
            {order.shipping_total > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shippingMethod")}</span>
                <span>{formatPrice(order.shipping_total, currency)}</span>
              </div>
            )}
            {order.tax_total > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart("vat")}</span>
                <span>{formatPrice(order.tax_total, currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>{tCart("total")}</span>
              <span className="text-brand-primary">{formatPrice(order.total, currency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        {order.shipping_address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                {t("shippingAddress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p className="text-muted-foreground">{order.shipping_address.address_1}</p>
              <p className="text-muted-foreground">
                {order.shipping_address.postal_code} {order.shipping_address.city}
              </p>
              <p className="text-muted-foreground">
                {order.shipping_address.country_code?.toUpperCase()}
              </p>
              {order.shipping_address.phone && (
                <p className="mt-1 text-muted-foreground">{order.shipping_address.phone}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shipping method */}
        {order.shipping_methods && order.shipping_methods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                {t("shippingMethod")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.shipping_methods.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{m.name}</span>
                  <span className="font-medium">
                    {m.amount === 0 ? t("free") : formatPrice(m.amount, currency)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tracking */}
        {trackingNumbers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                {t("tracking")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {trackingNumbers.map((num, i) => (
                <p key={i} className="font-mono">{num}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Invoices / Documents */}
        {invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                {t("invoiceTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">
                      {inv.type === "proforma" ? t("invoiceProforma") : t("invoiceFinal")} {inv.number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.issued_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {formatPrice(inv.total, inv.currency_code?.toUpperCase() ?? currency)}
                    </p>
                  </div>
                  {inv.pdf_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
