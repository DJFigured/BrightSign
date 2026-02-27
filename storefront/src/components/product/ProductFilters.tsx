"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

export interface FilterState {
  sort: string
  series: string[]
  lines: string[]
}

interface ProductFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  availableSeries: string[]
  availableLines: string[]
  resultCount: number
}

const SORT_OPTIONS = [
  { value: "default", labelKey: "sortDefault" },
  { value: "price-asc", labelKey: "sortPriceAsc" },
  { value: "price-desc", labelKey: "sortPriceDesc" },
  { value: "name-asc", labelKey: "sortNameAsc" },
] as const

const LINE_LABELS: Record<string, string> = {
  HD: "HD",
  XD: "XD",
  XT: "XT",
  XC: "XC",
  LS: "LS",
  AU: "AU",
}

export function ProductFilters({
  filters,
  onChange,
  availableSeries,
  availableLines,
  resultCount,
}: ProductFiltersProps) {
  const t = useTranslations("filters")
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeFilterCount =
    filters.series.length + filters.lines.length + (filters.sort !== "default" ? 1 : 0)

  function toggleSeries(s: string) {
    const next = filters.series.includes(s)
      ? filters.series.filter((x) => x !== s)
      : [...filters.series, s]
    onChange({ ...filters, series: next })
  }

  function toggleLine(l: string) {
    const next = filters.lines.includes(l)
      ? filters.lines.filter((x) => x !== l)
      : [...filters.lines, l]
    onChange({ ...filters, lines: next })
  }

  function clearAll() {
    onChange({ sort: "default", series: [], lines: [] })
  }

  const filterContent = (
    <>
      {/* Sort */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          {t("sort")}
        </label>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Series */}
      {availableSeries.length > 1 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("series")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableSeries.sort((a, b) => Number(b) - Number(a)).map((s) => (
              <button
                key={s}
                onClick={() => toggleSeries(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filters.series.includes(s)
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={filters.series.includes(s)}
              >
                {t("seriesN", { n: s })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lines */}
      {availableLines.length > 1 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("line")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableLines.map((l) => (
              <button
                key={l}
                onClick={() => toggleLine(l)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filters.lines.includes(l)
                    ? "bg-brand-accent text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={filters.lines.includes(l)}
              >
                {LINE_LABELS[l] ?? l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          {t("clearAll")}
        </button>
      )}
    </>
  )

  return (
    <>
      {/* Desktop toolbar */}
      <div className="hidden md:flex items-center gap-6 rounded-lg border border-gray-200 bg-white px-4 py-3">
        {filterContent}
        <div className="ml-auto text-xs text-muted-foreground">
          {resultCount} {t("results")}
        </div>
      </div>

      {/* Mobile toggle + panel */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t("filtersLabel")}
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {resultCount} {t("results")}
          </span>
        </Button>

        {mobileOpen && (
          <div className="mt-2 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("filtersLabel")}</span>
              <button onClick={() => setMobileOpen(false)} aria-label={t("close")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {filterContent}
          </div>
        )}
      </div>
    </>
  )
}
