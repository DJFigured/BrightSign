"use client"

import { useState } from "react"
import { useTranslations, useMessages } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { MobileMenu } from "./MobileMenu"
import { ShoppingCart, User, Search, Menu, ChevronDown } from "lucide-react"
import { useCart } from "@/lib/cart-context"

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
  const { cart } = useCart()

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/hledani?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const itemCount = cart?.items?.length ?? 0

  const series = navData?.series ?? []
  const lines = navData?.lines ?? []

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        {/* Top bar */}
        <div className="bg-brand-primary text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
            <span>{t("topBar")}</span>
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/b2b/registrace" className="hover:text-brand-accent transition-colors">
                {t("b2bRegistration")}
              </Link>
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0 text-xl font-bold text-brand-primary">
            Bright<span className="text-brand-accent">Sign</span>.cz
          </Link>

          {/* Search - desktop */}
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder={tc("search")}
              aria-label={tc("search")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={t("search")}
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tc("search")}
                className="pl-9"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Desktop category nav */}
        <nav className="hidden border-t border-border md:block">
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
