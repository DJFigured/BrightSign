"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/medusa-helpers"
import { Check, Loader2, Package, MapPin, CreditCard, ShoppingBag } from "lucide-react"
import { trackEcommerce, mapCartItemToGA4 } from "@/lib/analytics"
import StripePayment from "@/components/checkout/StripePayment"

type Step = "contact" | "address" | "shipping" | "payment" | "confirmation"

interface ShippingOption {
  id: string
  name: string
  amount: number
  is_tax_inclusive?: boolean
}

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function CheckoutPage() {
  const tc = useTranslations("common")
  const tCart = useTranslations("cart")
  const t = useTranslations("checkout")
  const locale = useLocale()
  const { cart, refreshCart, cartId } = useCart()
  const [step, setStep] = useState<Step>("contact")
  const [loading, setLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Map locale to default country code
  const localeCountryMap: Record<string, string> = {
    cs: "cz",
    sk: "sk",
    pl: "pl",
    en: "gb",
    de: "de",
  }

  // Form state
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode] = useState(localeCountryMap[locale] || "cz")
  const [selectedShipping, setSelectedShipping] = useState("")

  const currencyCode = cart?.currency_code
  const currency = currencyCode?.toUpperCase() ?? "CZK"
  const items = cart?.items ?? []

  // Track begin_checkout on first load
  const trackedCheckoutRef = useRef(false)
  useEffect(() => {
    if (trackedCheckoutRef.current || items.length === 0) return
    trackedCheckoutRef.current = true
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    const total = (cart?.total as number | undefined) ?? (cart?.subtotal as number | undefined)
    trackEcommerce("begin_checkout", ga4Items, { value: total ?? undefined, currency })
  }, [items, cart, currency])

  // Load shipping options when on shipping step
  useEffect(() => {
    if (step === "shipping" && cartId) {
      sdk.store.fulfillment
        .listCartOptions({ cart_id: cartId })
        .then(({ shipping_options }: { shipping_options: ShippingOption[] }) => {
          setShippingOptions(shipping_options ?? [])
        })
        .catch(console.error)
    }
  }, [step, cartId])

  // Initiate Stripe payment session when entering payment step
  useEffect(() => {
    if (step !== "payment" || !cartId || !cart) return

    async function initPayment() {
      try {
        if (STRIPE_KEY) {
          // Try Stripe first
          const result = await sdk.store.payment.initiatePaymentSession(
            cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
            { provider_id: "pp_stripe_stripe" }
          )
          const collection = result?.payment_collection ?? (result as Record<string, unknown>)?.payment_collection
          const sessions = (collection as Record<string, unknown>)?.payment_sessions as Array<Record<string, unknown>> | undefined
          const stripeSession = sessions?.find((s) => s.provider_id === "pp_stripe_stripe")
          const clientSecret = (stripeSession?.data as Record<string, unknown>)?.client_secret as string | undefined
          if (clientSecret) {
            setStripeClientSecret(clientSecret)
            return
          }
        }
        // Fallback to system_default (no Stripe key or Stripe not configured in backend)
        await sdk.store.payment.initiatePaymentSession(
          cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
          { provider_id: "pp_system_default" }
        )
      } catch {
        // If Stripe fails, try system_default
        try {
          await sdk.store.payment.initiatePaymentSession(
            cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
            { provider_id: "pp_system_default" }
          )
        } catch (err2) {
          console.error("Payment init failed:", err2)
        }
      }
    }

    initPayment()
  }, [step, cartId, cart])

  if (!cart || items.length === 0) {
    if (orderId) {
      return <ConfirmationView orderId={orderId} />
    }
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("cartEmpty")}</p>
      </div>
    )
  }

  const steps: { key: Step; label: string }[] = [
    { key: "contact", label: t("contact") },
    { key: "address", label: t("shipping") },
    { key: "shipping", label: t("shippingMethod") },
    { key: "payment", label: t("payment") },
  ]

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await sdk.store.cart.update(cartId!, { email })
      await refreshCart()
      setStep("address")
    } catch (err) {
      console.error("Failed to update contact:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const addressData = {
        first_name: firstName,
        last_name: lastName,
        address_1: address1,
        city,
        postal_code: postalCode,
        country_code: countryCode,
        phone,
      }
      await sdk.store.cart.update(cartId!, {
        shipping_address: addressData,
        billing_address: addressData,
      })
      await refreshCart()
      setStep("shipping")
    } catch (err) {
      console.error("Failed to update address:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedShipping) return
    setLoading(true)
    try {
      await sdk.store.cart.addShippingMethod(cartId!, {
        option_id: selectedShipping,
      })
      await refreshCart()
      // Track add_shipping_info
      const option = shippingOptions.find((o) => o.id === selectedShipping)
      const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
      trackEcommerce("add_shipping_info", ga4Items, {
        value: (cart?.total as number | undefined) ?? undefined,
        currency,
        shippingTier: option?.name,
      })
      setStep("payment")
    } catch (err) {
      console.error("Failed to add shipping:", err)
    } finally {
      setLoading(false)
    }
  }

  async function completeOrder() {
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    const result = await sdk.store.cart.complete(cartId!) as Record<string, unknown>
    if (result.type === "order") {
      const order = result.order as { id: string }
      trackEcommerce("purchase", ga4Items, {
        transactionId: order.id,
        value: (cart?.total as number | undefined) ?? undefined,
        currency,
      })
      setOrderId(order.id)
      setStep("confirmation")
    } else {
      console.error("Cart completion failed:", result)
    }
  }

  // Called after Stripe payment succeeds
  async function handleStripeSuccess() {
    setLoading(true)
    try {
      await completeOrder()
    } catch (err) {
      console.error("Complete after Stripe failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // Called for system_default (no Stripe) orders
  async function handlePlaceOrder() {
    setLoading(true)
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    trackEcommerce("add_payment_info", ga4Items, {
      value: (cart?.total as number | undefined) ?? undefined,
      currency,
      paymentType: stripeClientSecret ? "stripe" : "system_default",
    })

    try {
      await completeOrder()
    } catch (err) {
      console.error("Failed to place order:", err)
      // Fallback: try completing anyway
      try {
        await completeOrder()
      } catch (err2) {
        console.error("Fallback also failed:", err2)
      }
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart?.subtotal as number | undefined
  const shippingTotal = cart?.shipping_total as number | undefined
  const total = cart?.total as number | undefined

  const useStripe = !!STRIPE_KEY && !!stripeClientSecret

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{tc("checkout")}</h1>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s.key
                  ? "bg-brand-accent text-white"
                  : steps.findIndex((st) => st.key === step) > i
                    ? "bg-brand-primary text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {steps.findIndex((st) => st.key === step) > i ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span className="hidden text-sm sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === "contact" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("contact")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-brand-accent hover:bg-brand-accent-dark text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("continue")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "address" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("shipping")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">{t("firstName")}</Label>
                      <Input
                        id="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("lastName")}</Label>
                      <Input
                        id="lastName"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address1">{t("address")}</Label>
                    <Input
                      id="address1"
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">{t("city")}</Label>
                      <Input
                        id="city"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{t("postalCode")}</Label>
                      <Input
                        id="postalCode"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep("contact")}>
                      {t("back")}
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-brand-accent hover:bg-brand-accent-dark text-white">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("continue")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("shippingMethod")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {shippingOptions.length === 0 ? (
                    <p className="text-muted-foreground">{t("loadingShipping")}</p>
                  ) : (
                    <div className="space-y-2">
                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                            selectedShipping === option.id
                              ? "border-brand-accent bg-brand-accent/5"
                              : "border-border hover:border-brand-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={option.id}
                              checked={selectedShipping === option.id}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="accent-brand-accent"
                            />
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <span className="font-semibold">
                            {option.amount === 0
                              ? t("free")
                              : formatPrice(option.amount, currency)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep("address")}>
                      {t("back")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !selectedShipping}
                      className="bg-brand-accent hover:bg-brand-accent-dark text-white"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("continue")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("payment")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {paymentError}
                  </div>
                )}

                {useStripe ? (
                  <StripePayment
                    clientSecret={stripeClientSecret!}
                    onSuccess={handleStripeSuccess}
                    onError={(msg) => setPaymentError(msg)}
                  />
                ) : (
                  <>
                    <StripePayment />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep("shipping")}>
                        {t("back")}
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white"
                        size="lg"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("placeOrder")}
                      </Button>
                    </div>
                  </>
                )}

                {useStripe && (
                  <Button type="button" variant="outline" onClick={() => setStep("shipping")} className="mt-2">
                    {t("back")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}× {item.title}
                  </span>
                  <span>{formatPrice(item.unit_price * item.quantity, currency)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tCart("subtotal")}</span>
                <span>{formatPrice(subtotal ?? 0, currency)}</span>
              </div>
              {shippingTotal != null && shippingTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("shippingMethod")}</span>
                  <span>{formatPrice(shippingTotal, currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>{tCart("total")}</span>
                <span className="text-brand-primary">
                  {formatPrice(total ?? subtotal ?? 0, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface OrderData {
  id: string
  display_id: number
  status: string
  created_at: string
  email: string
  currency_code: string
  subtotal: number
  shipping_total: number
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
  } | null
  shipping_methods?: Array<{ name: string; amount: number }> | null
}

function ConfirmationView({ orderId }: { orderId: string }) {
  const t = useTranslations("checkout")
  const tCart = useTranslations("cart")
  const [order, setOrder] = useState<OrderData | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)

  useEffect(() => {
    sdk.store.order
      .retrieve(orderId)
      .then((res) => {
        setOrder((res as { order: OrderData }).order ?? res as unknown as OrderData)
      })
      .catch(console.error)
      .finally(() => setOrderLoading(false))
  }, [orderId])

  const currency = order?.currency_code?.toUpperCase() ?? "CZK"

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{t("orderPlaced")}</h1>
        <p className="text-muted-foreground">{t("orderSuccess")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("orderNumber")}: <span className="font-mono font-medium">{order?.display_id ?? orderId}</span>
        </p>
      </div>

      {orderLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : order ? (
        <div className="space-y-4">
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
                  <span className="text-muted-foreground">
                    {item.quantity}× {item.title}
                  </span>
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
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>{tCart("total")}</span>
                <span className="text-brand-primary">
                  {formatPrice(order.total, currency)}
                </span>
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

          {/* Payment status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                {t("paymentMethod")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {order.status === "completed" ? t("paid") : t("pending")}
              </Badge>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href="/ucet">{t("viewOrders")}</Link>
        </Button>
        <Button asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white">
          <Link href="/">{t("continueShopping")}</Link>
        </Button>
      </div>
    </div>
  )
}
