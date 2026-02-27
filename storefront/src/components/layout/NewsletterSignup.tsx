"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export function NewsletterSignup() {
  const t = useTranslations("footer.newsletter")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [website, setWebsite] = useState("") // honeypot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    try {
      const res = await fetch(`${MEDUSA_URL}/store/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          website: website || undefined,
        }),
      })

      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-brand-accent font-medium">
        {t("success")}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/90 disabled:opacity-50"
        >
          {t("subscribe")}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-xs text-red-400">
          {t("error")}
        </p>
      )}
    </form>
  )
}
