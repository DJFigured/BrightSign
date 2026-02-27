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
import { Check, Loader2, Package, MapPin, CreditCard, ShoppingBag, Building2, FileText, ChevronDown } from "lucide-react"
import { trackEcommerce, mapCartItemToGA4, trackPixel } from "@/lib/analytics"
import StripePayment from "@/components/checkout/StripePayment"

type Step = "contact" | "address" | "shipping" | "payment" | "confirmation"
type PaymentMethod = "card" | "bank_transfer"

interface ShippingOption {
  id: string
  name: string
  amount: number
  is_tax_inclusive?: boolean
}

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export function CheckoutPageClient() {
  const tc = useTranslations("common")
  const tCart = useTranslations("cart")
  const t = useTranslations("checkout")
  const locale = useLocale()
  const { cart, refreshCart, cartId } = useCart()
  const [step, setStep] = useState<Step>("contact")
  const [loading, setLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderDisplayId, setOrderDisplayId] = useState<number | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [bankTransferData, setBankTransferData] = useState<Record<string, unknown> | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Map locale to default country code
  const localeCountryMap: Record<string, string> = {
    cs: "cz",
    sk: "sk",
    pl: "pl",
    en: "gb",
    de: "de",
  }

  // Supported countries for shipping
  const supportedCountries = [
    { code: "cz", label: "Czechia" },
    { code: "sk", label: "Slovakia" },
    { code: "pl", label: "Poland" },
    { code: "de", label: "Deutschland" },
    { code: "at", label: "Austria" },
    { code: "hu", label: "Hungary" },
    { code: "ro", label: "Romania" },
    { code: "gb", label: "United Kingdom" },
  ]

  // Form state
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode, setCountryCode] = useState(localeCountryMap[locale] || "cz")
  const [selectedShipping, setSelectedShipping] = useState("")

  // Company fields (B2B)
  const [isCompany, setIsCompany] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [ico, setIco] = useState("")
  const [dic, setDic] = useState("")

  // Terms acceptance
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Billing address (different from shipping)
  const [billingDifferent, setBillingDifferent] = useState(false)
  const [billingFirstName, setBillingFirstName] = useState("")
  const [billingLastName, setBillingLastName] = useState("")
  const [billingAddress1, setBillingAddress1] = useState("")
  const [billingCity, setBillingCity] = useState("")
  const [billingPostalCode, setBillingPostalCode] = useState("")
  const [billingCountryCode, setBillingCountryCode] = useState(localeCountryMap[locale] || "cz")

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
    trackPixel("InitiateCheckout", {
      content_ids: items.map((item) => item.variant_id || item.id),
      num_items: items.length,
      value: total != null ? total / 100 : undefined,
      currency,
    })
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

  // Initiate payment session when entering payment step
  useEffect(() => {
    if (step !== "payment" || !cartId || !cart) return

    async function initPayment() {
      if (paymentMethod === "bank_transfer") {
        // Bank transfer: initiate with bank-transfer provider
        try {
          const result = await sdk.store.payment.initiatePaymentSession(
            cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
            { provider_id: "pp_bank-transfer_bank-transfer" }
          )
          const collection = result?.payment_collection ?? (result as Record<string, unknown>)?.payment_collection
          const sessions = (collection as Record<string, unknown>)?.payment_sessions as Array<Record<string, unknown>> | undefined
          const btSession = sessions?.find((s) => s.provider_id === "pp_bank-transfer_bank-transfer")
          if (btSession?.data) {
            setBankTransferData(btSession.data as Record<string, unknown>)
          }
        } catch (err) {
          console.error("Bank transfer init failed:", err)
          // Fallback to system_default
          try {
            await sdk.store.payment.initiatePaymentSession(
              cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
              { provider_id: "pp_system_default" }
            )
          } catch (err2) {
            console.error("Fallback payment init failed:", err2)
          }
        }
        return
      }

      // Card payment: try Stripe
      try {
        if (STRIPE_KEY) {
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
        // Fallback to system_default
        await sdk.store.payment.initiatePaymentSession(
          cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
          { provider_id: "pp_system_default" }
        )
      } catch {
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
  }, [step, cartId, cart, paymentMethod])

  if (!cart || items.length === 0) {
    if (orderId) {
      return <ConfirmationView orderId={orderId} orderDisplayId={orderDisplayId} paymentMethod={paymentMethod} bankTransferData={bankTransferData} />
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
    setFormError(null)
    try {
      await sdk.store.cart.update(cartId!, { email })
      await refreshCart()
      setStep("address")
    } catch {
      setFormError(t("errorContact"))
    } finally {
      setLoading(false)
    }
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    try {
      const shippingData = {
        first_name: firstName,
        last_name: lastName,
        company: isCompany ? companyName : undefined,
        address_1: address1,
        city,
        postal_code: postalCode,
        country_code: countryCode,
        phone,
      }

      const billingData = billingDifferent
        ? {
            first_name: billingFirstName,
            last_name: billingLastName,
            company: isCompany ? companyName : undefined,
            address_1: billingAddress1,
            city: billingCity,
            postal_code: billingPostalCode,
            country_code: billingCountryCode,
            phone,
          }
        : shippingData

      // Store company/ICO/DIC in cart metadata
      const metadata: Record<string, string> = {}
      if (isCompany) {
        if (companyName) metadata.company_name = companyName
        if (ico) metadata.company_ico = ico
        if (dic) metadata.company_dic = dic
      }

      await sdk.store.cart.update(cartId!, {
        shipping_address: shippingData,
        billing_address: billingData,
        ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
      })
      await refreshCart()
      setStep("shipping")
    } catch {
      setFormError(t("errorAddress"))
    } finally {
      setLoading(false)
    }
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedShipping) return
    setLoading(true)
    setFormError(null)
    try {
      await sdk.store.cart.addShippingMethod(cartId!, {
        option_id: selectedShipping,
      })
      await refreshCart()
      const option = shippingOptions.find((o) => o.id === selectedShipping)
      const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
      trackEcommerce("add_shipping_info", ga4Items, {
        value: (cart?.total as number | undefined) ?? undefined,
        currency,
        shippingTier: option?.name,
      })
      setStep("payment")
    } catch {
      setFormError(t("errorShipping"))
    } finally {
      setLoading(false)
    }
  }

  async function completeOrder() {
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    const result = await sdk.store.cart.complete(cartId!) as Record<string, unknown>
    if (result.type === "order") {
      const order = result.order as { id: string; display_id?: number }
      trackEcommerce("purchase", ga4Items, {
        transactionId: order.id,
        value: (cart?.total as number | undefined) ?? undefined,
        currency,
      })
      trackPixel("Purchase", {
        content_ids: items.map((item) => item.variant_id || item.id),
        content_type: "product",
        num_items: items.length,
        value: (cart?.total as number | undefined) != null ? (cart!.total as number) / 100 : undefined,
        currency,
      })
      setOrderId(order.id)
      setOrderDisplayId(order.display_id ?? null)
      setStep("confirmation")
    } else {
      setFormError(t("errorOrder"))
    }
  }

  async function handleStripeSuccess() {
    setLoading(true)
    setFormError(null)
    try {
      await completeOrder()
    } catch {
      setFormError(t("errorOrder"))
    } finally {
      setLoading(false)
    }
  }

  async function handlePlaceOrder() {
    setLoading(true)
    const ga4Items = items.map((item) => mapCartItemToGA4(item as unknown as Record<string, unknown>))
    trackEcommerce("add_payment_info", ga4Items, {
      value: (cart?.total as number | undefined) ?? undefined,
      currency,
      paymentType: paymentMethod === "bank_transfer" ? "bank_transfer" : stripeClientSecret ? "stripe" : "system_default",
    })

    try {
      await completeOrder()
    } catch {
      // Retry once
      try {
        await completeOrder()
      } catch {
        setFormError(t("errorOrder"))
      }
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart?.subtotal as number | undefined
  const shippingTotal = cart?.shipping_total as number | undefined
  const total = cart?.total as number | undefined

  const useStripe = paymentMethod === "card" && !!STRIPE_KEY && !!stripeClientSecret

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{tc("checkout")}</h1>

      {/* Step indicator */}
      <nav aria-label={t("checkoutSteps")} className="mb-8">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const currentIdx = steps.findIndex((st) => st.key === step)
            const isComplete = currentIdx > i
            const isCurrent = step === s.key
            return (
              <div key={s.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${s.label} — ${isComplete ? t("stepComplete") : isCurrent ? t("stepCurrent") : t("stepUpcoming")}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isCurrent
                        ? "bg-brand-accent text-white ring-4 ring-brand-accent/20"
                        : isComplete
                          ? "bg-brand-primary text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`mt-1.5 text-xs sm:text-sm ${
                    isCurrent ? "font-semibold text-brand-accent" : isComplete ? "text-brand-primary" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`mx-2 h-0.5 flex-1 rounded transition-colors ${
                      currentIdx > i ? "bg-brand-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          {formError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

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
                      autoComplete="email"
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
                      autoComplete="tel"
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
                  {/* Company toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isCompany}
                      aria-label={t("companyPurchase")}
                      onClick={() => setIsCompany(!isCompany)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isCompany ? "bg-brand-accent" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          isCompany ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <Label className="cursor-pointer" onClick={() => setIsCompany(!isCompany)}>
                      {t("companyPurchase")}
                    </Label>
                  </div>

                  {/* Company fields */}
                  {isCompany && (
                    <div className="space-y-4 rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4">
                      <div>
                        <Label htmlFor="companyName">{t("company")}</Label>
                        <Input
                          id="companyName"
                          autoComplete="organization"
                          required={isCompany}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="ico">{t("ico")}</Label>
                          <Input
                            id="ico"
                            value={ico}
                            onChange={(e) => setIco(e.target.value)}
                            placeholder={t("icoPlaceholder")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dic">{t("vatId")}</Label>
                          <Input
                            id="dic"
                            value={dic}
                            onChange={(e) => setDic(e.target.value)}
                            placeholder={t("dicPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Name fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">{t("firstName")}</Label>
                      <Input
                        id="firstName"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("lastName")}</Label>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Street address */}
                  <div>
                    <Label htmlFor="address1">{t("address")}</Label>
                    <Input
                      id="address1"
                      autoComplete="street-address"
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                    />
                  </div>

                  {/* City + Postal code */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">{t("city")}</Label>
                      <Input
                        id="city"
                        autoComplete="address-level2"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{t("postalCode")}</Label>
                      <Input
                        id="postalCode"
                        autoComplete="postal-code"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Country selector */}
                  <div>
                    <Label htmlFor="countryCode">{t("country")}</Label>
                    <div className="relative">
                      <select
                        id="countryCode"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={t("selectCountry")}
                      >
                        {supportedCountries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Different billing address toggle */}
                  <Separator />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={billingDifferent}
                      aria-label={t("differentBillingAddress")}
                      onClick={() => setBillingDifferent(!billingDifferent)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        billingDifferent ? "bg-brand-accent" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          billingDifferent ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <Label className="cursor-pointer" onClick={() => setBillingDifferent(!billingDifferent)}>
                      {t("differentBillingAddress")}
                    </Label>
                  </div>

                  {/* Billing address fields */}
                  {billingDifferent && (
                    <div className="space-y-4 rounded-lg border border-muted p-4">
                      <p className="text-sm font-medium text-muted-foreground">{t("billingAddress")}</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="billingFirstName">{t("firstName")}</Label>
                          <Input
                            id="billingFirstName"
                            autoComplete="billing given-name"
                            required={billingDifferent}
                            value={billingFirstName}
                            onChange={(e) => setBillingFirstName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">{t("lastName")}</Label>
                          <Input
                            id="billingLastName"
                            autoComplete="billing family-name"
                            required={billingDifferent}
                            value={billingLastName}
                            onChange={(e) => setBillingLastName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billingAddress1">{t("address")}</Label>
                        <Input
                          id="billingAddress1"
                          autoComplete="billing street-address"
                          required={billingDifferent}
                          value={billingAddress1}
                          onChange={(e) => setBillingAddress1(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="billingCity">{t("city")}</Label>
                          <Input
                            id="billingCity"
                            autoComplete="billing address-level2"
                            required={billingDifferent}
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">{t("postalCode")}</Label>
                          <Input
                            id="billingPostalCode"
                            autoComplete="billing postal-code"
                            required={billingDifferent}
                            value={billingPostalCode}
                            onChange={(e) => setBillingPostalCode(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="billingCountryCode">{t("country")}</Label>
                        <div className="relative">
                          <select
                            id="billingCountryCode"
                            value={billingCountryCode}
                            onChange={(e) => setBillingCountryCode(e.target.value)}
                            className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={t("selectCountry")}
                          >
                            {supportedCountries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}

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

                {/* Payment method selection */}
                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "card"
                        ? "border-brand-accent bg-brand-accent/5"
                        : "border-border hover:border-brand-accent/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => { setPaymentMethod("card"); setBankTransferData(null) }}
                      className="accent-brand-accent"
                    />
                    <CreditCard className="h-5 w-5 text-brand-primary" />
                    <div>
                      <span className="font-medium">{t("payByCard")}</span>
                      <p className="text-xs text-muted-foreground">{t("payByCardDesc")}</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "bank_transfer"
                        ? "border-brand-accent bg-brand-accent/5"
                        : "border-border hover:border-brand-accent/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => { setPaymentMethod("bank_transfer"); setStripeClientSecret(null) }}
                      className="accent-brand-accent"
                    />
                    <Building2 className="h-5 w-5 text-brand-primary" />
                    <div>
                      <span className="font-medium">{t("payByTransfer")}</span>
                      <p className="text-xs text-muted-foreground">{t("payByTransferDesc")}</p>
                    </div>
                  </label>
                </div>

                {/* Terms acceptance */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-brand-accent"
                      required
                    />
                    <span className="text-sm text-muted-foreground">
                      {t("termsAgreePre")}
                      <Link href="/obchodni-podminky" target="_blank" className="text-brand-accent hover:underline">
                        {t("termsLink")}
                      </Link>
                      {t("termsAgreeAnd")}
                      <Link href="/ochrana-udaju" target="_blank" className="text-brand-accent hover:underline">
                        {t("privacyLink")}
                      </Link>
                      {t("termsAgreePost")}
                    </span>
                  </label>
                </div>

                {/* Card payment */}
                {paymentMethod === "card" && (
                  <>
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
                            disabled={loading || !termsAccepted}
                            className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white"
                            size="lg"
                          >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("placeOrder")}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Bank transfer */}
                {paymentMethod === "bank_transfer" && (
                  <>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                      <p className="text-sm font-medium text-blue-900">{t("bankTransferInfo")}</p>
                      <p className="text-xs text-blue-700">{t("bankTransferNote")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep("shipping")}>
                        {t("back")}
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading || !termsAccepted}
                        className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white"
                        size="lg"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("placeOrderTransfer")}
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

// ─── Confirmation View ──────────────────────────────────────────────────────

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

function ConfirmationView({
  orderId,
  orderDisplayId,
  paymentMethod,
  bankTransferData,
}: {
  orderId: string
  orderDisplayId: number | null
  paymentMethod: PaymentMethod
  bankTransferData: Record<string, unknown> | null
}) {
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
  const isBankTransfer = paymentMethod === "bank_transfer"
  const variableSymbol = String(order?.display_id || orderDisplayId || "")

  // Determine bank account from env or bankTransferData
  const isCZK = currency === "CZK"
  const accountNumber = (bankTransferData?.account_number as string)
    || (isCZK ? "335584589/0300" : "335645089/0300")
  const iban = (bankTransferData?.iban as string) || ""

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{t("orderPlaced")}</h1>
        <p className="text-muted-foreground">
          {isBankTransfer ? t("orderSuccessTransfer") : t("orderSuccess")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("orderNumber")}: <span className="font-mono font-medium">{order?.display_id ?? orderId}</span>
        </p>
      </div>

      {/* Bank transfer payment instructions */}
      {isBankTransfer && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-900">
              <Building2 className="h-4 w-4" />
              {t("bankTransferInstructions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-blue-700">{t("bankAccount")}:</span>
              <span className="font-mono font-medium text-blue-900">{accountNumber}</span>
              {iban && (
                <>
                  <span className="text-blue-700">IBAN:</span>
                  <span className="font-mono text-sm text-blue-900">{iban}</span>
                </>
              )}
              <span className="text-blue-700">{t("variableSymbol")}:</span>
              <span className="font-mono font-bold text-blue-900">{variableSymbol}</span>
              <span className="text-blue-700">{t("amountToPay")}:</span>
              <span className="font-bold text-blue-900">
                {order ? formatPrice(order.total, currency) : "..."}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-2">{t("bankTransferEmailNote")}</p>
          </CardContent>
        </Card>
      )}

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
                {isBankTransfer ? <Building2 className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                {t("paymentMethod")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isBankTransfer ? (
                <Badge variant="secondary">{t("pendingTransfer")}</Badge>
              ) : (
                <Badge variant="secondary">
                  {order.status === "completed" ? t("paid") : t("pending")}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Invoice note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                {t("invoiceTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isBankTransfer ? t("invoiceProformaNote") : t("invoiceEmailNote")}
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
