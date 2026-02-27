"use client"

import { useState } from "react"
import { useTranslations, useMessages } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { LocaleSwitcher } from "./LocaleSwitcher"
import { ChevronDown } from "lucide-react"
import type { HeaderNavData } from "./Header"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  navData?: HeaderNavData
}

export function MobileMenu({ open, onClose, navData }: MobileMenuProps) {
  const t = useTranslations("common")
  const th = useTranslations("header")
  const messages = useMessages()
  const navLabels = (messages as Record<string, unknown>).nav as Record<string, string> | undefined
  const catName = (handle: string, fallback: string) => navLabels?.[handle] ?? fallback
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const series = navData?.series ?? []
  const lines = navData?.lines ?? []

  const accountItems = [
    { href: "/prihlaseni" as const, label: t("login") },
    { href: "/registrace" as const, label: t("register") },
    { href: "/b2b/registrace" as const, label: th("b2bRegistration") },
  ]

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold text-brand-primary">
            Bright<span className="text-brand-accent">Sign</span>.cz
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-1">
          {/* Home */}
          <Link
            href="/"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {t("home")}
          </Link>

          {/* Přehrávače - collapsible */}
          <button
            onClick={() => toggleSection("players")}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            aria-expanded={expandedSections.has("players")}
          >
            {th("players")}
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has("players") ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.has("players") && (
            <div className="ml-3 flex flex-col gap-0.5">
              <Link
                href="/kategorie/prehravace"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-sm text-brand-accent font-medium hover:bg-muted transition-colors"
              >
                {catName("allPlayers", "Všechny přehrávače")}
              </Link>

              {/* Series */}
              {series.map((s) => (
                <div key={s.handle}>
                  <button
                    onClick={() => toggleSection(s.handle)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                    aria-expanded={expandedSections.has(s.handle)}
                  >
                    {catName(s.handle, s.name)}
                    {s.children.length > 0 && (
                      <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has(s.handle) ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  {expandedSections.has(s.handle) && s.children.length > 0 && (
                    <div className="ml-3 flex flex-col gap-0.5">
                      {s.children.map((ch) => (
                        <Link
                          key={ch.handle}
                          href={`/kategorie/${ch.handle}`}
                          onClick={onClose}
                          className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {catName(ch.handle, ch.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Product Lines */}
              {lines.length > 0 && (
                <>
                  <Separator className="my-1" />
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {catName("byLine", "Podle řady")}
                  </p>
                  {lines.map((l) => (
                    <Link
                      key={l.handle}
                      href={`/kategorie/${l.handle}`}
                      onClick={onClose}
                      className="rounded-md px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      {catName(l.handle, l.name)}
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Příslušenství */}
          {navData?.hasAccessories && (
            <Link
              href="/kategorie/prislusenstvi"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {th("accessories")}
            </Link>
          )}
        </nav>

        <Separator className="my-4" />

        <nav className="flex flex-col gap-1">
          {accountItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="px-3">
          <p className="mb-2 text-xs text-muted-foreground">{th("language")}</p>
          <LocaleSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  )
}
