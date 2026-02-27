"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { useTranslations, useMessages } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { MobileMenu } from "./MobileMenu"
import { ShoppingCart, User, Search, Menu, ChevronDown, Loader2, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/medusa-helpers"

export interface NavSeriesItem {
  name: string
  handle: string
  children: Array<{ name: string; handle: string }>
}

export interface NavLineItem {
  name: string
  handle: string
  description?: string | null
}

export interface HeaderNavData {
  series: NavSeriesItem[]
  lines: NavLineItem[]
  hasAccessories: boolean
}

interface HeaderProps {
  navData?: HeaderNavData
}

export function Header({ navData }: HeaderProps) {
  const t = useTranslations("header")
  const tc = useTranslations("common")
  const messages = useMessages()
  const navLabels = (messages as Record<string, unknown>).nav as Record<string, string> | undefined
  const catName = (handle: string, fallback: string) => navLabels?.[handle] ?? fallback
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; handle: string; thumbnail?: string | null; price?: number; currency?: string }>>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined)
  const searchRef = useRef<HTMLDivElement>(null)
  const { cart } = useCart()

  // Debounced search suggestions
  const fetchSuggestions = useCallback((q: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    setSuggestionsLoading(true)
    searchDebounce.current = setTimeout(async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const res = await fetch(`${backendUrl}/store/products?q=${encodeURIComponent(q)}&limit=5&fields=title,handle,thumbnail,variants.calculated_price`, {
          headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
        })
        if (res.ok) {
          const data = await res.json()
          const items = (data.products ?? []).map((p: Record<string, unknown>) => {
            const v = (p.variants as Array<{ calculated_price?: { calculated_amount?: number; currency_code?: string } }> | undefined)?.[0]
            return {
              id: p.id as string,
              title: p.title as string,
              handle: p.handle as string,
              thumbnail: p.thumbnail as string | null | undefined,
              price: v?.calculated_price?.calculated_amount,
              currency: v?.calculated_price?.currency_code?.toUpperCase(),
            }
          })
          setSuggestions(items)
          setSuggestionsOpen(items.length > 0)
        }
      } catch {
        // Silently fail
      } finally {
        setSuggestionsLoading(false)
      }
    }, 300)
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestionsOpen) {
      e.preventDefault()
      setSelectedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp" && suggestionsOpen) {
      e.preventDefault()
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter") {
      if (selectedIdx >= 0 && selectedIdx < suggestions.length) {
        e.preventDefault()
        const item = suggestions[selectedIdx]
        router.push(`/produkt/${item.handle}`)
        setSuggestionsOpen(false)
        setSearchOpen(false)
        setSearchQuery("")
        setSelectedIdx(-1)
      } else if (searchQuery.trim()) {
        router.push(`/hledani?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchOpen(false)
        setSuggestionsOpen(false)
        setSelectedIdx(-1)
      }
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false)
      setSelectedIdx(-1)
    }
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setSelectedIdx(-1)
    fetchSuggestions(value)
  }

  const itemCount = cart?.items?.length ?? 0

  const series = navData?.series ?? []
  const lines = navData?.lines ?? []

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        {/* Top bar — hidden on very small screens, truncated on mobile */}
        <div className="bg-brand-primary text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
            <span className="truncate">{t("topBar")}</span>
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/b2b/registrace" className="hover:text-brand-accent transition-colors whitespace-nowrap">
                {t("b2bRegistration")}
              </Link>
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="BrightSign.cz">
            <Image
              src="/logo.svg"
              alt="BrightSign.cz"
              width={180}
              height={30}
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>

          {/* Search - desktop */}
          <div ref={searchRef} className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            {suggestionsLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            <Input
              placeholder={tc("search")}
              aria-label={tc("search")}
              className="pl-9"
              maxLength={200}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
              role="combobox"
              aria-expanded={suggestionsOpen}
              aria-autocomplete="list"
            />
            {/* Search suggestions dropdown */}
            {suggestionsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg" role="listbox">
                {suggestions.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/produkt/${item.handle}`}
                    onClick={() => { setSuggestionsOpen(false); setSearchQuery(""); setSelectedIdx(-1) }}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors first:rounded-t-lg last:rounded-b-lg ${idx === selectedIdx ? "bg-muted" : "hover:bg-muted/50"}`}
                    role="option"
                    aria-selected={idx === selectedIdx}
                  >
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded object-contain" />
                    ) : (
                      <div className="h-8 w-8 shrink-0 rounded bg-muted" />
                    )}
                    <span className="flex-1 truncate text-sm">{item.title}</span>
                    {item.price != null && item.currency && (
                      <span className="shrink-0 text-sm font-semibold text-brand-primary">
                        {formatPrice(item.price, item.currency)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                if (searchOpen) {
                  setSearchOpen(false)
                  setSuggestionsOpen(false)
                  setSearchQuery("")
                  setSelectedIdx(-1)
                } else {
                  setSearchOpen(true)
                }
              }}
              aria-label={searchOpen ? tc("close") : t("search")}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/prihlaseni" aria-label={t("account")}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/kosik" aria-label={itemCount > 0 ? `${t("cart")} (${itemCount})` : t("cart")}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent p-0 text-[10px] text-white" aria-hidden="true">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="border-t border-border px-4 py-2 md:hidden">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={tc("search")}
                  className="pl-9 pr-3"
                  autoFocus
                  maxLength={200}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => { setSearchOpen(false); setSuggestionsOpen(false); setSearchQuery(""); setSelectedIdx(-1) }}
                aria-label={tc("close")}
              >
                <X className="h-5 w-5" />
              </Button>
              {suggestionsOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg" role="listbox">
                  {suggestions.map((item, idx) => (
                    <Link
                      key={item.id}
                      href={`/produkt/${item.handle}`}
                      onClick={() => { setSuggestionsOpen(false); setSearchOpen(false); setSearchQuery(""); setSelectedIdx(-1) }}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors first:rounded-t-lg last:rounded-b-lg ${idx === selectedIdx ? "bg-muted" : "hover:bg-muted/50"}`}
                      role="option"
                      aria-selected={idx === selectedIdx}
                    >
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded object-contain" />
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded bg-muted" />
                      )}
                      <span className="flex-1 truncate text-sm">{item.title}</span>
                      {item.price != null && item.currency && (
                        <span className="shrink-0 text-sm font-semibold text-brand-primary">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop category nav */}
        <nav aria-label={t("players")} className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-sm">
            {/* Přehrávače with mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Link
                href="/kategorie/prehravace"
                className="flex items-center gap-1 font-medium text-foreground hover:text-brand-accent transition-colors"
              >
                {t("players")}
                <ChevronDown className="h-3 w-3" />
              </Link>

              {/* Mega dropdown */}
              {dropdownOpen && (series.length > 0 || lines.length > 0) && (
                <div className="absolute left-0 top-full z-50 w-[520px] max-w-[calc(100vw-2rem)] rounded-b-lg border border-t-0 border-border bg-white p-4 shadow-lg">
                  <div className="grid grid-cols-2 gap-6">
                    {/* By Series */}
                    {series.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {catName("bySeries", "Podle série")}
                        </p>
                        <div className="flex flex-col gap-1">
                          {series.map((s) => (
                            <div key={s.handle}>
                              <Link
                                href={`/kategorie/${s.handle}`}
                                className="block rounded px-2 py-1 text-sm font-medium hover:bg-muted transition-colors"
                                onClick={() => setDropdownOpen(false)}
                              >
                                {catName(s.handle, s.name)}
                              </Link>
                              {s.children.length > 0 && (
                                <div className="ml-3 flex flex-col">
                                  {s.children.map((ch) => (
                                    <Link
                                      key={ch.handle}
                                      href={`/kategorie/${ch.handle}`}
                                      className="block rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                      onClick={() => setDropdownOpen(false)}
                                    >
                                      {catName(ch.handle, ch.name)}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* By Product Line */}
                    {lines.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {catName("byLine", "Podle řady")}
                        </p>
                        <div className="flex flex-col gap-1">
                          {lines.map((l) => (
                            <Link
                              key={l.handle}
                              href={`/kategorie/${l.handle}`}
                              className="group block rounded px-2 py-1 hover:bg-muted transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <span className="text-sm font-medium">{catName(l.handle, l.name)}</span>
                              {l.description && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  — {l.description.split(" – ")[0]}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Příslušenství */}
            {navData?.hasAccessories && (
              <Link
                href="/kategorie/prislusenstvi"
                className="font-medium text-foreground hover:text-brand-accent transition-colors"
              >
                {t("accessories")}
              </Link>
            )}

            {/* Direct series links */}
            {series.map((s) => (
              <Link
                key={s.handle}
                href={`/kategorie/${s.handle}`}
                className="font-medium text-foreground hover:text-brand-accent transition-colors"
              >
                {catName(s.handle, s.name)}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navData={navData}
      />
    </>
  )
}
