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

const PRODUCT_LINES = [
  {
    code: "LS",
    name: "LS Přehrávače",
    label: "Basic",
    description: "Základní Full HD řešení pro jednoduché displeje",
    href: "/kategorie/ls-prehravace",
    icon: Monitor,
    color: "bg-slate-100 text-slate-700",
  },
  {
    code: "HD",
    name: "HD Přehrávače",
    label: "Entry 4K",
    description: "Vstupní 4K přehrávače s HTML5 a HDR",
    href: "/kategorie/hd-prehravace",
    icon: Tv,
    color: "bg-blue-100 text-blue-700",
  },
  {
    code: "XD",
    name: "XD Přehrávače",
    label: "Performance 4K",
    description: "Výkonné 4K přehrávače s WebGL grafikou",
    href: "/kategorie/xd-prehravace",
    icon: Cpu,
    color: "bg-purple-100 text-purple-700",
  },
  {
    code: "XT",
    name: "XT Přehrávače",
    label: "Enterprise",
    description: "Prémiové přehrávače s duálním 4K/8K výstupem",
    href: "/kategorie/xt-prehravace",
    icon: Layers,
    color: "bg-brand-accent/10 text-brand-accent",
  },
  {
    code: "XC",
    name: "XC Přehrávače",
    label: "Video Wall",
    description: "Multi-display a video stěny",
    href: "/kategorie/xc-prehravace",
    icon: Zap,
    color: "bg-amber-100 text-amber-700",
  },
  {
    code: "AU",
    name: "AU Přehrávače",
    label: "Audio",
    description: "Specializované audio přehrávače pro ozvučení",
    href: "/kategorie/au-prehravace",
    icon: Music,
    color: "bg-rose-100 text-rose-700",
  },
]

const SEGMENT_GUIDE = [
  {
    level: "Začátečník",
    description: "Jednoduché prezentace, digitální menu, informační panely",
    recommendation: "LS nebo HD řada",
    href: "/kategorie/hd-prehravace",
  },
  {
    level: "Standard",
    description: "Retail displeje, korporátní komunikace, interaktivní obsah",
    recommendation: "HD nebo XD řada",
    href: "/kategorie/xd-prehravace",
  },
  {
    level: "Pokročilý",
    description: "Multi-screen instalace, video stěny, 8K obsah, live TV",
    recommendation: "XT nebo XC řada",
    href: "/kategorie/xt-prehravace",
  },
]

export function HomepageClient({ featuredProducts }: Props) {
  const t = useTranslations("home")

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
                B2B registrace
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
                  Zobrazit vše
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id as string}
                  product={product as Parameters<typeof ProductCard>[0]["product"]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Lines - "Vyberte podle řady" */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">Vyberte podle řady</h2>
          <p className="mb-8 text-center text-muted-foreground">
            BrightSign nabízí 6 produktových řad pro každý typ instalace
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {PRODUCT_LINES.map((line) => {
              const Icon = line.icon
              return (
                <Link key={line.code} href={line.href}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${line.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold">{line.name}</h3>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {line.label}
                      </Badge>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {line.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Segment Guide - "Průvodce výběrem" */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold">Průvodce výběrem</h2>
          <p className="mb-8 text-center text-muted-foreground">
            Nevíte jaký přehrávač potřebujete? Pomůžeme vám s výběrem.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {SEGMENT_GUIDE.map((seg) => (
              <Link key={seg.level} href={seg.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-bold text-brand-primary">{seg.level}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{seg.description}</p>
                    <Badge className="bg-brand-accent/10 text-brand-accent">
                      {seg.recommendation}
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
          <h2 className="mb-8 text-center text-2xl font-bold">Proč BrightSign?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">#1</div>
              <h3 className="font-semibold">Celosvětová jednička</h3>
              <p className="mt-1 text-sm text-white/70">Nejvíce nasazených digital signage přehrávačů na světě</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">5 let</div>
              <h3 className="font-semibold">Záruka</h3>
              <p className="mt-1 text-sm text-white/70">Série 6 s 5letou zárukou — nejdelší v oboru</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">0 %</div>
              <h3 className="font-semibold">Poplatky za licence</h3>
              <p className="mt-1 text-sm text-white/70">Žádné měsíční licenční poplatky za hardware</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-brand-accent">24/7</div>
              <h3 className="font-semibold">Spolehlivost</h3>
              <p className="mt-1 text-sm text-white/70">Nepřetržitý provoz bez výpadků díky purpose-built OS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clearance Banner */}
      <section className="bg-orange-50 py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-3 bg-orange-500 text-white">Doprodej</Badge>
          <h2 className="mb-2 text-2xl font-bold">Série 4 za zvýhodněné ceny</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Přehrávače předchozí generace za výprodejové ceny. Ideální pro rozšíření stávajících instalací nebo projekty s omezeným rozpočtem.
          </p>
          <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/kategorie/serie-4">
              Zobrazit doprodej
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
