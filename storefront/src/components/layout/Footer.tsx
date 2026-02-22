import { useTranslations, useMessages } from "next-intl"
import { Link } from "@/i18n/navigation"
import type { HeaderNavData } from "./Header"

interface FooterProps {
  navData?: HeaderNavData
}

export function Footer({ navData }: FooterProps) {
  const t = useTranslations("footer")
  const tc = useTranslations("common")
  const messages = useMessages()
  const navLabels = (messages as Record<string, unknown>).nav as Record<string, string> | undefined
  const catName = (handle: string, fallback: string) => navLabels?.[handle] ?? fallback

  const series = navData?.series ?? []

  return (
    <footer className="bg-brand-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="mb-3 text-lg font-bold">
              Bright<span className="text-brand-accent">Sign</span>.cz
            </h3>
            <p className="text-sm text-white/60">{t("description")}</p>
            <p className="mt-3 text-sm text-white/60">{t("company")}</p>
          </div>

          {/* Products - dynamic */}
          <div>
            <h4 className="mb-3 font-semibold">{tc("products")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {series.map((s) => (
                <li key={s.handle}>
                  <Link href={`/kategorie/${s.handle}`} className="hover:text-brand-accent transition-colors">
                    BrightSign {catName(s.handle, s.name)}
                  </Link>
                </li>
              ))}
              {navData?.hasAccessories && (
                <li>
                  <Link href="/kategorie/prislusenstvi" className="hover:text-brand-accent transition-colors">
                    {t("accessories")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 font-semibold">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/b2b/registrace" className="hover:text-brand-accent transition-colors">
                  {t("b2bRegistration")}
                </Link>
              </li>
              <li>
                <Link href="/obchodni-podminky" className="hover:text-brand-accent transition-colors">
                  {tc("terms")}
                </Link>
              </li>
              <li>
                <Link href="/ochrana-udaju" className="hover:text-brand-accent transition-colors">
                  {tc("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/reklamace" className="hover:text-brand-accent transition-colors">
                  {tc("returns")}
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-brand-accent transition-colors">
                  {tc("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-semibold">{tc("contact")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>info@brightsign.cz</li>
              <li>Make more s.r.o.</li>
              <li>IČO: 21890161</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          &copy; {t("copyright", { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </footer>
  )
}
