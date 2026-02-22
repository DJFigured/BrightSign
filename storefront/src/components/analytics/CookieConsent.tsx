"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"

interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = "cookie_consent"

function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function updateGTMConsent(prefs: ConsentPreferences) {
  if (typeof window === "undefined") return
  // gtag consent update — works with both GTM and standalone GA4
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.marketing ? "granted" : "denied",
      ad_user_data: prefs.marketing ? "granted" : "denied",
      ad_personalization: prefs.marketing ? "granted" : "denied",
    })
  }

  // Meta Pixel consent
  const fb = window as unknown as { fbq?: (...args: unknown[]) => void }
  if (typeof fb.fbq === "function") {
    if (prefs.marketing) {
      fb.fbq("consent", "grant")
    } else {
      fb.fbq("consent", "revoke")
    }
  }
}

export function CookieConsent() {
  const t = useTranslations("cookies")
  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState<ConsentPreferences>({
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) {
      // Already consented — apply saved preferences
      updateGTMConsent(stored)
    } else {
      // No consent yet — show banner
      setVisible(true)
    }
  }, [])

  const saveConsent = useCallback((newPrefs: ConsentPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs))
    updateGTMConsent(newPrefs)
    setVisible(false)
  }, [])

  const acceptAll = useCallback(() => {
    saveConsent({ analytics: true, marketing: true })
  }, [saveConsent])

  const rejectAll = useCallback(() => {
    saveConsent({ analytics: false, marketing: false })
  }, [saveConsent])

  const saveCustom = useCallback(() => {
    saveConsent(prefs)
  }, [saveConsent, prefs])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">{t("title")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>

        {showSettings && (
          <div className="mt-4 space-y-3">
            {/* Analytics */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                className="mt-1 accent-brand-accent"
              />
              <div>
                <span className="text-sm font-medium">{t("analyticsLabel")}</span>
                <p className="text-xs text-muted-foreground">{t("analyticsDesc")}</p>
              </div>
            </label>

            {/* Marketing */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                className="mt-1 accent-brand-accent"
              />
              <div>
                <span className="text-sm font-medium">{t("marketingLabel")}</span>
                <p className="text-xs text-muted-foreground">{t("marketingDesc")}</p>
              </div>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={acceptAll}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/90"
          >
            {t("acceptAll")}
          </button>
          <button
            onClick={rejectAll}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t("rejectAll")}
          </button>
          {showSettings ? (
            <button
              onClick={saveCustom}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("save")}
            </button>
          ) : (
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("settings")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
