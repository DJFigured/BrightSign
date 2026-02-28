"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product/ProductCard"
import Image from "next/image"
import {
  Shield, Zap, HeadphonesIcon, Monitor, Music, Layers, Tv, Cpu, Truck, Award,
  BadgeCheck, ArrowRight, Globe, Users,
  TrendingUp, Presentation, Clock, Wifi,
  MessageCircle, Check, Gauge, Leaf, Phone, Store, ShieldCheck
} from "lucide-react"

interface Props {
  featuredProducts: Array<Record<string, unknown>>
}

const PRODUCT_LINE_ICONS: Record<string, typeof Monitor> = {
  LS: Monitor, HD: Tv, XD: Cpu, XT: Layers, XC: Zap, AU: Music,
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

const DIGITAL_SIGNAGE_ITEMS = [
  { icon: TrendingUp, key: "sales" as const },
  { icon: Presentation, key: "communication" as const },
  { icon: Clock, key: "time" as const },
  { icon: Wifi, key: "remote" as const },
] as const

const SERIE6_PRODUCTS = [
  { key: "hd226", model: "HD226", href: "/kategorie/hd-prehravace", highlighted: false, image: "/products/hd6-front.png" },
  { key: "hd1026", model: "HD1026", href: "/kategorie/hd-prehravace", highlighted: false, image: "/products/hd6-front.png" },
  { key: "xd236", model: "XD236", href: "/kategorie/xd-prehravace", highlighted: true, image: "/products/xd6-front.png" },
  { key: "xd1036", model: "XD1036", href: "/kategorie/xd-prehravace", highlighted: false, image: "/products/xd6-front.png" },
] as const

const BRIGHTSIGNOS_FEATURES = [
  { key: "secure" as const, icon: Shield },
  { key: "reliable" as const, icon: Zap },
  { key: "superior" as const, icon: Gauge },
  { key: "sustainable" as const, icon: Leaf },
] as const

export function HomepageClient({ featuredProducts }: Props) {
  const t = useTranslations("home")
  const tp = useTranslations("product")

  return (
    <>
      {/* ============================================================ */}
      {/* 1. HERO — Split Layout (V1 Flagship)                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary-light py-20 text-white md:py-28">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute right-20 top-20 h-96 w-96 rounded-full bg-brand-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-pink-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left: Text */}
            <div>
              <Link href="/kategorie/serie-6" className="group mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/20">
                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                <span className="font-medium text-white/90">{t("hero.newBadge")}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {t("hero.title")}
              </h1>
              <p className="mb-8 max-w-lg text-lg text-white/80">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white shadow-lg shadow-brand-accent/25 transition-all hover:shadow-xl hover:shadow-brand-accent/30">
                  <Link href="/kategorie/prehravace">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Link href="/kontakt">
                    {t("hero.b2bCta")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Product Visual */}
            <div className="hidden justify-center md:flex">
              <div className="relative">
                <div className="flex h-80 w-80 flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm">
                  <Image
                    src="/products/xd6-front.png"
                    alt={t("hero.heroProduct")}
                    width={220}
                    height={180}
                    className="mb-4 drop-shadow-2xl"
                    priority
                  />
                  <div className="text-center">
                    <div className="text-sm text-white/60">{t("hero.heroProductBrand")}</div>
                    <div className="mt-1 text-xl font-bold text-brand-accent">{t("hero.heroProductPrice")}</div>
                    <div className="text-xs text-white/40">{t("hero.heroProductPriceNote")}</div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -right-4 -top-4 rounded-lg bg-white px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-gray-800">{t("hero.inStock")}</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-lg bg-white px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-primary" />
                    <span className="text-xs font-semibold text-gray-800">{t("hero.warranty5y")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TAB NAVIGATION                                            */}
      {/* ============================================================ */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="-mb-px flex overflow-x-auto">
            <Link href="/kategorie/prehravace" className="whitespace-nowrap border-b-[3px] border-brand-accent px-6 py-4 text-sm font-semibold text-brand-primary transition-colors">
              {t("tabNav.products")}
            </Link>
            <Link href="/reseni" className="whitespace-nowrap border-b-2 border-transparent px-6 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-primary">
              {t("tabNav.solutions")}
            </Link>
            <Link href="/kontakt" className="whitespace-nowrap border-b-2 border-transparent px-6 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-primary">
              {t("tabNav.support")}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. TRUST SIGNALS                                             */}
      {/* ============================================================ */}
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
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SERIE 6 SHOWCASE — V1 product cards                       */}
      {/* ============================================================ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">{t("serie6.badge")}</Badge>
            <h2 className="mb-4 text-3xl font-bold text-brand-primary md:text-4xl">{t("serie6.title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("serie6.subtitle")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERIE6_PRODUCTS.map((product) => (
              <Link key={product.key} href={product.href} className="group">
                <div className={`overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${product.highlighted ? "relative border-brand-accent/30" : "border-border hover:border-brand-primary/30"}`}>
                  {product.highlighted && (
                    <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-brand-accent px-3 py-1 text-xs font-bold text-white">
                      {t("serie6.xd236.bestseller")}
                    </div>
                  )}
                  {/* Dark gradient header with product image */}
                  <div className={`relative flex h-48 flex-col items-center justify-end p-6 ${product.highlighted ? "bg-gradient-to-br from-brand-primary to-pink-600" : "bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary/80"}`}>
                    <div className="absolute left-3 top-3 rounded-full bg-brand-accent/20 px-2.5 py-1 text-xs font-bold text-brand-accent">
                      {t(`serie6.${product.key}.tag`)}
                    </div>
                    <Image
                      src={product.image}
                      alt={product.model}
                      width={140}
                      height={100}
                      className="mb-2 drop-shadow-lg"
                    />
                    <div className="mb-1 text-lg font-bold text-white">{product.model}</div>
                    <div className="text-xs text-white/50">{t(`serie6.${product.key}.headerSub`)}</div>
                  </div>
                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="mb-1 font-semibold">{t(`serie6.${product.key}.name`)}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{t(`serie6.${product.key}.desc`)}</p>
                    <ul className="mb-4 space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 shrink-0 text-brand-primary" />
                        {t(`serie6.${product.key}.spec1`)}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 shrink-0 text-brand-primary" />
                        {t(`serie6.${product.key}.spec2`)}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 shrink-0 text-brand-primary" />
                        {t(`serie6.${product.key}.spec3`)}
                      </li>
                    </ul>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">{t("serie6.from")}</div>
                        <div className="text-xl font-bold text-brand-primary">{t(`serie6.${product.key}.price`)}</div>
                        <div className="text-xs text-muted-foreground">{t("serie6.exVat")}</div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition-all group-hover:bg-brand-accent-dark">
                        {t("serie6.buy")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/kategorie/prehravace" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark">
              {t("serie6.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BRIGHTSINGOS — Purple gradient                            */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-16 md:grid-cols-2">
            {/* Left: Feature list */}
            <div>
              <Badge className="mb-6 bg-white/10 text-brand-accent hover:bg-white/20">{t("brightSignOS.badge")}</Badge>
              <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
                {t("brightSignOS.title")}
              </h2>
              <p className="mb-8 text-lg text-white/70">
                {t("brightSignOS.subtitle")}
              </p>
              <ul className="space-y-4">
                {BRIGHTSIGNOS_FEATURES.map((feature) => (
                  <li key={feature.key} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary-light/30">
                      <feature.icon className="h-3.5 w-3.5 text-brand-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t(`brightSignOS.${feature.key}.title`)}</div>
                      <div className="text-sm text-white/60">{t(`brightSignOS.${feature.key}.desc`)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Abstract OS visual */}
            <div className="hidden items-center justify-center md:flex">
              <div className="relative h-80 w-80">
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border-2 border-brand-accent/20">
                  <div className="flex h-56 w-56 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="h-3 w-full rounded-full bg-brand-accent/30">
                      <div className="h-full w-3/4 rounded-full bg-brand-accent" />
                    </div>
                    <div className="h-3 w-full rounded-full bg-brand-primary-light/30">
                      <div className="h-full w-1/2 rounded-full bg-brand-primary-light" />
                    </div>
                    <div className="h-3 w-full rounded-full bg-pink-500/30">
                      <div className="h-full w-5/6 rounded-full bg-pink-500" />
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-brand-accent">99.99%</div>
                      <div className="mt-1 text-xs text-white/50">{t("brightSignOS.uptime")}</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-3 -top-3 rounded-lg bg-brand-accent/20 px-3 py-1.5">
                  <span className="text-xs font-bold text-brand-accent">5W</span>
                </div>
                <div className="absolute -bottom-3 -left-3 rounded-lg bg-brand-primary-light/20 px-3 py-1.5">
                  <span className="text-xs font-bold text-brand-primary-light">0 malware</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. USE CASES VISUAL — 2-col layout from V1                   */}
      {/* ============================================================ */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left: Image placeholder */}
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-primary-light/10">
              <div className="p-8 text-center">
                <Store className="mx-auto mb-4 h-16 w-16 text-brand-primary/40" />
                <div className="text-lg font-semibold text-brand-primary">{t("useCasesVisual.imagePlaceholder")}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("useCasesVisual.imageSubtitle")}</div>
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 shadow-md">
                <div className="text-xs text-muted-foreground">{t("useCasesVisual.powerLabel")}</div>
                <div className="font-bold text-brand-primary">{t("useCasesVisual.powerValue")}</div>
              </div>
            </div>

            {/* Right: Text + checklist */}
            <div>
              <Badge variant="secondary" className="mb-4">{t("useCasesVisual.badge")}</Badge>
              <h2 className="mb-4 text-3xl font-bold text-brand-primary">{t("useCasesVisual.title")}</h2>
              <p className="mb-6 text-lg text-muted-foreground">{t("useCasesVisual.subtitle")}</p>
              <ul className="mb-8 space-y-3">
                {(["check1", "check2", "check3", "check4"] as const).map((key) => (
                  <li key={key} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 font-bold text-brand-primary" />
                    <span>{t(`useCasesVisual.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" asChild className="bg-brand-accent text-white shadow-lg shadow-brand-accent/25 hover:bg-brand-accent-dark">
                <Link href="/kontakt">
                  {t("useCasesVisual.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. WHY BUY FROM US — 6-card grid (V1 style)                  */}
      {/* ============================================================ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-brand-primary md:text-4xl">{t("whyUs.title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("whyUs.subtitle")}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BadgeCheck, titleKey: "specialist" as const, descKey: "specialistDesc" as const },
              { icon: ShieldCheck, titleKey: "warranty5" as const, descKey: "warranty5Desc" as const },
              { icon: HeadphonesIcon, titleKey: "techSupport" as const, descKey: "techSupportDesc" as const },
              { icon: Users, titleKey: "b2bProgram" as const, descKey: "b2bProgramDesc" as const },
              { icon: Truck, titleKey: "fastDelivery" as const, descKey: "fastDeliveryDesc" as const },
              { icon: Globe, titleKey: "multiLang" as const, descKey: "multiLangDesc" as const },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl p-6 transition-colors hover:bg-muted/50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <item.icon className="h-6 w-6 text-brand-primary" />
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

      {/* ============================================================ */}
      {/* 8. NEED HELP CTA + phone                                     */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-primary-light py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("needHelp.title")}</h2>
          <p className="mb-8 text-lg text-white/70">{t("needHelp.subtitle")}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-brand-accent text-white shadow-lg shadow-brand-accent/25 hover:bg-brand-accent-dark">
              <Link href="/kontakt">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("needHelp.cta")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
              <a href={`tel:${t("needHelp.phoneHref")}`}>
                <Phone className="mr-2 h-5 w-5" />
                {t("needHelp.phoneCta")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. DIGITAL SIGNAGE — What is it                              */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-white to-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">{t("digitalSignage.title")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("digitalSignage.subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIGITAL_SIGNAGE_ITEMS.map((item) => (
              <Card key={item.key} className="border-0 shadow-md transition-shadow hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10">
                    <item.icon className="h-7 w-7 text-brand-accent" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{t(`digitalSignage.${item.key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`digitalSignage.${item.key}.desc`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. WHY BRIGHTSIGN — stats + benefit cards                   */}
      {/* ============================================================ */}
      <section className="bg-brand-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">{t("whyBrightsignSection.title")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/70">{t("whyBrightsignSection.subtitle")}</p>
          </div>

          {/* Stats grid */}
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {(["stat1", "stat2", "stat3", "stat4"] as const).map((stat) => (
              <div key={stat} className="text-center">
                <div className="text-3xl font-bold text-brand-accent md:text-4xl">
                  {t(`whyBrightsignSection.${stat}.value`)}
                </div>
                <div className="mt-1 font-semibold">{t(`whyBrightsignSection.${stat}.label`)}</div>
                <p className="mt-1 text-sm text-white/60">{t(`whyBrightsignSection.${stat}.desc`)}</p>
              </div>
            ))}
          </div>

          {/* Benefit cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {([
              { key: "os" as const, icon: Cpu },
              { key: "software" as const, icon: Monitor },
              { key: "warranty" as const, icon: Shield },
            ]).map((item) => (
              <div key={item.key} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/20">
                  <item.icon className="h-5 w-5 text-brand-accent" />
                </div>
                <h3 className="text-lg font-semibold">{t(`whyBrightsignSection.${item.key}.title`)}</h3>
                <p className="mt-2 text-sm text-white/70">{t(`whyBrightsignSection.${item.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. PRODUCT LINES                                            */}
      {/* ============================================================ */}
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
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
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

      {/* ============================================================ */}
      {/* 12. SEGMENT GUIDE                                            */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* 13. FEATURED PRODUCTS                                        */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* 14. CLEARANCE BANNER                                         */}
      {/* ============================================================ */}
      <section className="bg-orange-50 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-3 bg-orange-500 text-white">{tp("clearance")}</Badge>
          <h2 className="mb-2 text-2xl font-bold">{t("clearance.title")}</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            {t("clearance.description")}
          </p>
          <Button size="lg" asChild className="bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/kategorie/serie-4">
              {t("clearance.cta")}
            </Link>
          </Button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 15. B2B BANNER                                               */}
      {/* ============================================================ */}
      <section className="bg-brand-primary/5 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("b2b.title")}</h2>
          <p className="mb-6 text-muted-foreground">{t("b2b.subtitle")}</p>
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
