"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { LocaleSwitcher } from "./LocaleSwitcher"

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations("common")

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/kategorie/prehravace", label: "Přehrávače" },
    { href: "/kategorie/prislusenstvi", label: "Příslušenství" },
    { href: "/kategorie/serie-5", label: "Série 5" },
    { href: "/kategorie/serie-4", label: "Série 4" },
  ]

  const accountItems = [
    { href: "/prihlaseni", label: t("login") },
    { href: "/registrace", label: t("register") },
    { href: "/b2b/registrace", label: "B2B registrace" },
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
          {navItems.map((item) => (
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
          <p className="mb-2 text-xs text-muted-foreground">Jazyk / Language</p>
          <LocaleSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  )
}
