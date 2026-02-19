import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function HomePage() {
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
          <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-dark text-white">
            <Link href="/kategorie/prehravace">
              {t("hero.cta")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-border bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-brand-accent mb-2 text-3xl">🚚</div>
            <h3 className="font-semibold">{t("trust.delivery")}</h3>
            <p className="text-muted-foreground text-sm">{t("trust.deliveryDesc")}</p>
          </div>
          <div className="text-center">
            <div className="text-brand-accent mb-2 text-3xl">🛡️</div>
            <h3 className="font-semibold">{t("trust.warranty")}</h3>
            <p className="text-muted-foreground text-sm">{t("trust.warrantyDesc")}</p>
          </div>
          <div className="text-center">
            <div className="text-brand-accent mb-2 text-3xl">💬</div>
            <h3 className="font-semibold">{t("trust.support")}</h3>
            <p className="text-muted-foreground text-sm">{t("trust.supportDesc")}</p>
          </div>
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
