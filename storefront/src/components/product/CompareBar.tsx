"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useCompare } from "@/lib/compare-context"
import { Button } from "@/components/ui/button"
import { X, GitCompareArrows } from "lucide-react"

export function CompareBar() {
  const { items, removeItem, clear } = useCompare()
  const t = useTranslations("compare")

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5"
            >
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center bg-gray-100 text-[8px] text-muted-foreground">
                  N/A
                </div>
              )}
              <span className="max-w-[120px] truncate text-xs font-medium">
                {item.title}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="default"
            size="sm"
            asChild
            disabled={items.length < 2}
            className="bg-brand-accent hover:bg-brand-accent/90"
          >
            <Link href="/porovnani">
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
              {t("compare")} ({items.length})
            </Link>
          </Button>
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {t("clear")}
          </button>
        </div>
      </div>
    </div>
  )
}
