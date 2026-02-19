"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/medusa-helpers"
import { Check, Loader2 } from "lucide-react"

type Step = "contact" | "address" | "shipping" | "payment" | "confirmation"

interface ShippingOption {
  id: string
  name: string
  amount: number
  is_tax_inclusive?: boolean
}

export default function CheckoutPage() {
  const tc = useTranslations("common")
  const { cart, refreshCart, cartId } = useCart()
  const [step, setStep] = useState<Step>("contact")
  const [loading, setLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode] = useState("cz")
  const [selectedShipping, setSelectedShipping] = useState("")

  const currencyCode = cart?.currency_code
  const currency = currencyCode?.toUpperCase() ?? "CZK"
  const items = cart?.items ?? []

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

  if (!cart || items.length === 0) {
    if (orderId) {
      return <ConfirmationView orderId={orderId} />
    }
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Košík je prázdný</p>
      </div>
    )
  }

  const steps: { key: Step; label: string }[] = [
    { key: "contact", label: "Kontakt" },
    { key: "address", label: "Adresa" },
    { key: "shipping", label: "Doprava" },
    { key: "payment", label: "Platba" },
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
      setStep("payment")
    } catch (err) {
      console.error("Failed to add shipping:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePlaceOrder() {
    setLoading(true)
    try {
      // Initialize payment session
      await sdk.store.payment.initiatePaymentSession(cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0], {
        provider_id: "pp_system_default",
      })

      // Complete the cart
      const result = await sdk.store.cart.complete(cartId!) as Record<string, unknown>
      if (result.type === "order") {
        const order = result.order as { id: string }
        setOrderId(order.id)
        setStep("confirmation")
      } else {
        console.error("Cart completion failed:", result)
      }
    } catch (err) {
      console.error("Failed to place order:", err)
      // Fallback: try without payment
      try {
        const result = await sdk.store.cart.complete(cartId!) as Record<string, unknown>
        if (result.type === "order") {
          const order = result.order as { id: string }
          setOrderId(order.id)
          setStep("confirmation")
        }
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
                <CardTitle>Kontaktní údaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vas@email.cz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-brand-accent hover:bg-brand-accent-dark text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pokračovat
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "address" && (
            <Card>
              <CardHeader>
                <CardTitle>Dodací adresa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">Jméno</Label>
                      <Input
                        id="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Příjmení</Label>
                      <Input
                        id="lastName"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address1">Ulice a číslo popisné</Label>
                    <Input
                      id="address1"
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">Město</Label>
                      <Input
                        id="city"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">PSČ</Label>
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
                      Zpět
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-brand-accent hover:bg-brand-accent-dark text-white">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Pokračovat
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle>Způsob dopravy</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {shippingOptions.length === 0 ? (
                    <p className="text-muted-foreground">Načítám možnosti dopravy...</p>
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
                              ? "Zdarma"
                              : formatPrice(option.amount, currency)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep("address")}>
                      Zpět
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !selectedShipping}
                      className="bg-brand-accent hover:bg-brand-accent-dark text-white"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Pokračovat
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Platba</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Stripe platební brána bude aktivována po dodání API klíčů.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Prozatím bude objednávka vytvořena bez online platby.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("shipping")}>
                    Zpět
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white"
                    size="lg"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Dokončit objednávku
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shrnutí objednávky</CardTitle>
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
                <span className="text-muted-foreground">Mezisoučet</span>
                <span>{formatPrice(subtotal ?? 0, currency)}</span>
              </div>
              {shippingTotal != null && shippingTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doprava</span>
                  <span>{formatPrice(shippingTotal, currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Celkem</span>
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

function ConfirmationView({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Děkujeme za objednávku!</h1>
      <p className="mb-2 text-muted-foreground">
        Vaše objednávka byla úspěšně vytvořena.
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Číslo objednávky: <span className="font-mono font-medium">{orderId}</span>
      </p>
      <Button asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white">
        <Link href="/">Zpět na hlavní stránku</Link>
      </Button>
    </div>
  )
}
