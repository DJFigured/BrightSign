"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MapPin, Package, Check } from "lucide-react"

export interface PacketaPoint {
  id: string
  name: string
  address: string
  zip: string
  city: string
  country: string
}

interface PacketaWidgetProps {
  onPointSelected?: (point: PacketaPoint) => void
  country?: string
}

interface PacketaPickResult {
  id: string
  name: string
  place: string
  street: string
  city: string
  zip: string
  country: string
}

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPickResult | null) => void,
          options?: Record<string, unknown>
        ) => void
      }
    }
  }
}

const PACKETA_SCRIPT_URL =
  "https://widget.packeta.com/v6/www/js/library.js"

export default function PacketaWidget({
  onPointSelected,
  country = "cz",
}: PacketaWidgetProps) {
  const t = useTranslations("checkout")
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<PacketaPoint | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY

  // Load Packeta widget script
  useEffect(() => {
    if (!apiKey) return

    const existing = document.querySelector(
      `script[src="${PACKETA_SCRIPT_URL}"]`
    )
    if (existing) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = PACKETA_SCRIPT_URL
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setScriptError(true)
    document.head.appendChild(script)
  }, [apiKey])

  const openWidget = useCallback(() => {
    if (!window.Packeta || !apiKey) return

    window.Packeta.Widget.pick(
      apiKey,
      (point) => {
        if (point) {
          const mapped: PacketaPoint = {
            id: point.id,
            name: point.name,
            address: point.street || point.place,
            zip: point.zip,
            city: point.city,
            country: point.country || country,
          }
          setSelectedPoint(mapped)
          onPointSelected?.(mapped)
        }
      },
      {
        country: country.toLowerCase(),
        language: country.toLowerCase(),
      }
    )
  }, [apiKey, country, onPointSelected])

  // No API key - show placeholder
  if (!apiKey) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
        <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {t("packetaNote")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("packetaNote2")}
        </p>
      </div>
    )
  }

  // Script failed to load
  if (scriptError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-700">{t("packetaLoadError")}</p>
      </div>
    )
  }

  // Point already selected
  if (selectedPoint) {
    return (
      <div className="rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
            <Check className="h-4 w-4 text-brand-accent" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{selectedPoint.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedPoint.address}, {selectedPoint.city}{" "}
              {selectedPoint.zip}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={openWidget}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          {t("packetaChange")}
        </Button>
      </div>
    )
  }

  // Default: show button to open widget
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-2 border-dashed py-6 text-muted-foreground hover:border-brand-accent hover:text-brand-accent"
      onClick={openWidget}
      disabled={!scriptLoaded}
    >
      <MapPin className="mr-2 h-5 w-5" />
      {scriptLoaded ? t("packetaSelect") : t("packetaLoading")}
    </Button>
  )
}
