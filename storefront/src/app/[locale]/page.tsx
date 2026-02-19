import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function HomePage() {
  const t = useTranslations("home")
  const tc = useTranslations("common")

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="text-xl font-bold">
            Bright<span className="text-accent">Sign</span>.cz
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="hover:text-accent transition-colors">
              {tc("home")}
            </Link>
            <Link
              href="/kategorie"
              className="hover:text-accent transition-colors"
            >
              {tc("products")}
            </Link>
            <Link
              href="/kosik"
              className="hover:text-accent transition-colors"
            >
              {tc("cart")}
            </Link>
            <Link
              href="/ucet"
              className="hover:text-accent transition-colors"
            >
              {tc("login")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary-dark py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            {t("hero.subtitle")}
          </p>
          <Link
            href="/kategorie"
            className="bg-accent hover:bg-accent-dark inline-block rounded-lg px-8 py-3 font-semibold text-white transition-colors"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-border bg-surface py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-accent mb-2 text-3xl">🚚</div>
            <h3 className="font-semibold">{t("trust.delivery")}</h3>
            <p className="text-muted text-sm">{t("trust.deliveryDesc")}</p>
          </div>
          <div className="text-center">
            <div className="text-accent mb-2 text-3xl">🛡️</div>
            <h3 className="font-semibold">{t("trust.warranty")}</h3>
            <p className="text-muted text-sm">{t("trust.warrantyDesc")}</p>
          </div>
          <div className="text-center">
            <div className="text-accent mb-2 text-3xl">💬</div>
            <h3 className="font-semibold">{t("trust.support")}</h3>
            <p className="text-muted text-sm">{t("trust.supportDesc")}</p>
          </div>
        </div>
      </section>

      {/* B2B Banner */}
      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("b2b.title")}</h2>
          <p className="text-muted mb-6">{t("b2b.subtitle")}</p>
          <Link
            href="/b2b/registrace"
            className="bg-primary hover:bg-primary-light inline-block rounded-lg px-8 py-3 font-semibold text-white transition-colors"
          >
            {t("b2b.cta")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-3 text-lg font-bold">
                Bright<span className="text-accent">Sign</span>.cz
              </h3>
              <p className="text-sm text-white/60">
                {/* Footer description will come from translations */}
                Make more s.r.o. — Autorizovaný distributor BrightSign
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">{tc("products")}</h4>
              <ul className="space-y-1 text-sm text-white/60">
                <li>BrightSign Série 5</li>
                <li>BrightSign Série 4</li>
                <li>Příslušenství</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">{tc("contact")}</h4>
              <ul className="space-y-1 text-sm text-white/60">
                <li>info@brightsign.cz</li>
                <li>Make more s.r.o.</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/40">
            © 2026 Make more s.r.o. Všechna práva vyhrazena.
          </div>
        </div>
      </footer>
    </div>
  )
}
