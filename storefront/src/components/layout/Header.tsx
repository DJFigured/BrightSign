"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { MobileMenu } from "./MobileMenu"
import { ShoppingCart, User, Search, Menu } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function Header() {
  const t = useTranslations("common")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { cart } = useCart()

  const itemCount = cart?.items?.length ?? 0

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        {/* Top bar */}
        <div className="bg-brand-primary text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
            <span>Autorizovaný distributor BrightSign pro ČR a EU</span>
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/b2b/registrace" className="hover:text-brand-accent transition-colors">
                B2B registrace
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="pl-9"
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
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/prihlaseni">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/kosik">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent p-0 text-[10px] text-white">
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
                placeholder={t("search")}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Desktop category nav */}
        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-sm">
            <Link
              href="/kategorie/prehravace"
              className="font-medium text-foreground hover:text-brand-accent transition-colors"
            >
              Přehrávače
            </Link>
            <Link
              href="/kategorie/prislusenstvi"
              className="font-medium text-foreground hover:text-brand-accent transition-colors"
            >
              Příslušenství
            </Link>
            <Link
              href="/kategorie/serie-5"
              className="font-medium text-foreground hover:text-brand-accent transition-colors"
            >
              Série 5
            </Link>
            <Link
              href="/kategorie/serie-4"
              className="font-medium text-foreground hover:text-brand-accent transition-colors"
            >
              Série 4
            </Link>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
