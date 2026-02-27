"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product/ProductCard"
import { Shield, Zap, HeadphonesIcon, Monitor, Music, Layers, Tv, Cpu } from "lucide-react"

interface Props {
  featuredProducts: Array<Record<string, unknown>>
}

const PRODUCT_LINE_ICONS: Record<string, typeof Monitor> = {
  LS: Monitor,
  HD: Tv,
  XD: Cpu,
  XT: Layers,
  XC: Zap,
  AU: Music,
}

const PRODUCT_LINE_COLORS: Record<string, string> = {
  LS: "bg-slate-100 text-slate-700",
  HD: "bg-blue-100 text-blue-700",
  XD: "bg-purple-100 text-purple-700",
  XT: "bg-brand-accent/10 text-brand-accent",
  XC: "bg-amber-100 text-amber-700",
  AU: "bg-rose-100 text-rose-700",
}

const LINE_CODES = ["LS", "HD", "XD", "XT", "XC", "AU"] as const
const LINE_HREFS: Record<string, string> = {
  LS: "/kategorie/ls-prehravace",
  HD: "/kategorie/hd-prehravace",
  XD: "/kategorie/xd-prehravace",
  XT: "/kategorie/xt-prehravace",
  XC: "/kategorie/xc-prehravace",
  AU: "/kategorie/au-prehravace",
}

const SEGMENT_KEYS = ["beginner", "standard", "advanced"] as const
const SEGMENT_HREFS: Record<string, string> = {
  beginner: "/kategorie/hd-prehravace",
  standard: "/kategorie/xd-prehravace",
  advanced: "/kategorie/xt-prehravace",
}

export function HomepageClient({ featuredProducts }: Props) {
  const t = useTranslations("home")
  const tp = useTranslations("product")

  return (
    <>
      {/* Hero Section */}
      <section className="bg-brand-primary-dark py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white">
              <Link href="/kategorie/prehravace">
                {t("hero.cta")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link href="/b2b/registrace">
                {t("hero.b2bCta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-border bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <Zap className="h-6 w-6 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-semibold">{t("trust.delivery")}</h3>
              <p className="text-muted-foreground text-sm">{t("trust.deliveryDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <Shield className="h-6 w-6 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-semibold">{t("trust.warranty")}</h3>
              <p className="text-muted-foreground text-sm">{t("trust.warrantyDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <HeadphonesIcon className="h-6 w-6 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-semibold">{t("trust.support")}</h3>
              <p className="text-muted-foreground text-sm">{t("trust.supportDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("featured")}</h2>
              <Button variant="outline" asChild>
                <Link href="/kategorie/prehravace">
                  {t("viewAll")}
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product, idx) => (
                <ProductCard
                  key={product.id as string}
                  product={product as Parameters<typeof ProductCard>[0]["product"]}
                  listName="featured"
                  index={idx}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Lines */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">{t("productLines.title")}</h2>
          <p className="mb-8 text-center text-muted-foreground">
            {t("productLines.subtitle")}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {LINE_CODES.map((code) => {
              const Icon = PRODUCT_LINE_ICONS[code]
              const lowerCode = code.toLowerCase()
              return (
                <Link key={code} href={LINE_HREFS[code]}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${PRODUCT_LINE_COLORS[code]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold">{t(`productLines.${lowerCode}.name`)}</h3>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {t(`productLines.${lowerCode}.label`)}
                      </Badge>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {t(`productLines.${lowerCode}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Segment Guide */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">{t("segmentGuide.title")}</h2>
          <p className="mb-8 text-center text-muted-foreground">
            {t("segmentGuide.subtitle")}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {SEGMENT_KEYS.map((key) => (
              <Link key={key} href={SEGMENT_HREFS[key]}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-bold text-brand-primary">{t(`segmentGuide.${key}.level`)}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{t(`segmentGuide.${key}.description`)}</p>
                    <Badge className="bg-brand-accent/10 text-brand-accent">
                      {t(`segmentGuide.${key}.recommendation`)}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why BrightSign */}
      <section className="bg-brand-primary text-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">{t("whyBrightsign.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">#1</div>
              <h3 className="font-semibold">{t("whyBrightsign.leaderTitle")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("whyBrightsign.leaderDesc")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">{t("whyBrightsign.warrantyValue")}</div>
              <h3 className="font-semibold">{t("whyBrightsign.warrantyTitle")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("whyBrightsign.warrantyDesc")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">0 %</div>
              <h3 className="font-semibold">{t("whyBrightsign.licenseTitle")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("whyBrightsign.licenseDesc")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">24/7</div>
              <h3 className="font-semibold">{t("whyBrightsign.reliabilityTitle")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("whyBrightsign.reliabilityDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clearance Banner */}
      <section className="bg-orange-50 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-3 bg-orange-500 text-white">{tp("clearance")}</Badge>
          <h2 className="mb-2 text-2xl font-bold">{t("clearance.title")}</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            {t("clearance.description")}
          </p>
          <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/kategorie/serie-4">
              {t("clearance.cta")}
            </Link>
          </Button>
        </div>
      </section>

      {/* B2B Banner */}
      <section className="bg-brand-primary/5 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("b2b.title")}</h2>
          <p className="text-muted-foreground mb-6">{t("b2b.subtitle")}</p>
          <Button size="lg" asChild>
            <Link href="/b2b/registrace">
              {t("b2b.cta")}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
