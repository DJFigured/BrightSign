"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, ShieldCheck } from "lucide-react"

interface StripePaymentProps {
  clientSecret?: string
  onSuccess?: () => void
  onError?: (msg: string) => void
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

const stripePromise = stripeKey ? loadStripe(stripeKey) : null

function StripeForm({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (msg: string) => void
}) {
  const t = useTranslations("checkout")
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!stripe || !elements) return

      setLoading(true)
      setErrorMsg(null)

      try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/pokladna?payment=success`,
          },
          redirect: "if_required",
        })

        if (error) {
          const msg = error.message ?? t("paymentFailed")
          setErrorMsg(msg)
          onError?.(msg)
        } else {
          onSuccess?.()
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("paymentFailed")
        setErrorMsg(msg)
        onError?.(msg)
      } finally {
        setLoading(false)
      }
    },
    [stripe, elements, onSuccess, onError, t]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {t("payNow")}
          </>
        )}
      </Button>
    </form>
  )
}

export default function StripePayment({
  clientSecret,
  onSuccess,
  onError,
}: StripePaymentProps) {
  const t = useTranslations("checkout")

  // No Stripe key configured - show placeholder
  if (!stripeKey) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
        <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {t("stripeNote")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("stripeNote2")}
        </p>
      </div>
    )
  }

  // Key present but no client secret yet - show loading state
  if (!clientSecret) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
        <CreditCard className="mx-auto mb-3 h-8 w-8 text-brand-primary" />
        <p className="text-sm text-muted-foreground">
          {t("stripeInitializing")}
        </p>
      </div>
    )
  }

  // Full Stripe Elements integration
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-brand-accent" />
        <span>{t("securePayment")}</span>
      </div>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#00c389",
              colorBackground: "#ffffff",
              colorText: "#1a2b4a",
              fontFamily: "system-ui, sans-serif",
              borderRadius: "8px",
            },
          },
        }}
      >
        <StripeForm onSuccess={onSuccess} onError={onError} />
      </Elements>
    </div>
  )
}
