"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { locales, localeNames, type Locale } from "@/i18n/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale as Locale })
  }

  return (
    <Select value={locale} onValueChange={onLocaleChange}>
      <SelectTrigger className="h-8 w-[100px] border-0 bg-transparent text-sm font-medium focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {localeNames[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
