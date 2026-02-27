"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product/ProductCard"
import { Shield, Zap, HeadphonesIcon, Monitor, Music, Layers, Tv, Cpu, Truck, Award, BadgeCheck, Sparkles, ArrowRight, Globe, Users, Package, Wrench } from "lucide-react"

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
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary-light py-20 text-white md:py-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-brand-accent blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-brand-accent blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center">
          {/* Series 6 badge */}
          <Link href="/kategorie/serie-6" className="group mb-6 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-brand-accent/20">
            <Sparkles className="h-4 w-4 text-brand-accent" />
            <span>{t("hero.newBadge")}</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 md:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white shadow-lg shadow-brand-accent/25 transition-all hover:shadow-xl hover:shadow-brand-accent/30">
              <Link href="/kategorie/prehravace">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/b2b/registrace">
                {t("hero.b2bCta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Signals - 6 items */}
      <section className="border-b border-border bg-white py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Zap, title: t("trust.delivery"), desc: t("trust.deliveryDesc") },
            { icon: Shield, title: t("trust.warranty"), desc: t("trust.warrantyDesc") },
            { icon: HeadphonesIcon, title: t("trust.support"), desc: t("trust.supportDesc") },
            { icon: BadgeCheck, title: t("trust.noLicense"), desc: t("trust.noLicenseDesc") },
            { icon: Award, title: t("trust.authorized"), desc: t("trust.authorizedDesc") },
            { icon: Truck, title: t("trust.euShipping"), desc: t("trust.euShippingDesc") },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
                <item.icon className="h-5 w-5 text-brand-accent" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="py-12 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">{t("whyUs.title")}</h2>
          <p className="mb-8 text-center text-muted-foreground">{t("whyUs.subtitle")}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Award, titleKey: "specialist" as const, descKey: "specialistDesc" as const },
              { icon: Users, titleKey: "b2bProgram" as const, descKey: "b2bProgramDesc" as const },
              { icon: Globe, titleKey: "multiLang" as const, descKey: "multiLangDesc" as const },
              { icon: Package, titleKey: "fastDelivery" as const, descKey: "fastDeliveryDesc" as const },
              { icon: Wrench, titleKey: "techSupport" as const, descKey: "techSupportDesc" as const },
              { icon: Shield, titleKey: "warranty5" as const, descKey: "warranty5Desc" as const },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 rounded-lg border border-border bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                  <item.icon className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{t(`whyUs.${item.titleKey}`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`whyUs.${item.descKey}`)}</p>
                </div>
              </div>
            ))}
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
