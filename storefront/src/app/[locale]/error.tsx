"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("common")

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-primary mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">{t("error")}</h2>
        <p className="text-gray-600 mb-8">
          {t("errorDescription")}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-brand-accent text-white px-6 py-3 rounded-lg hover:bg-brand-accent/90 transition-colors"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  )
}
