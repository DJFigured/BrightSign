import Image from "next/image"
import { useTranslations, useMessages } from "next-intl"
import { Link } from "@/i18n/navigation"
import { NewsletterSignup } from "./NewsletterSignup"
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company + Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-3 inline-block" aria-label="eBrightSign">
              <Image
                src="/logo-light.svg"
                alt="eBrightSign"
                width={180}
                height={30}
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-sm text-white/60">{t("description")}</p>
            <p className="mt-3 text-sm text-white/60">{t("company")}</p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold">{t("newsletter.title")}</h4>
              <NewsletterSignup />
            </div>
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
          <nav aria-label={t("quickLinks")}>
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
              <li>
                <Link href="/faq" className="hover:text-brand-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/reseni" className="hover:text-brand-accent transition-colors">
                  {t("solutions")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact + Payment */}
          <div>
            <h4 className="mb-3 font-semibold">{tc("contact")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="mailto:info@brightsign.cz" className="hover:text-brand-accent transition-colors">
                  info@brightsign.cz
                </a>
              </li>
              <li>Make more s.r.o.</li>
              <li>IČO: 21890161</li>
            </ul>

            {/* Payment methods */}
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold">{t("paymentMethods")}</h4>
              <div className="flex flex-wrap gap-2">
                {/* Visa */}
                <span className="inline-flex items-center rounded border border-white/20 bg-white px-2.5 py-1.5" aria-label="Visa">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-5 w-8">
                    <rect width="48" height="32" rx="4" fill="#fff"/>
                    <path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.3-10.2c-.5-.2-1.4-.4-2.4-.4-2.6 0-4.5 1.4-4.5 3.4 0 1.5 1.3 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-.6 0-1.1-.1-1.8-.3l-.5 2.3c.7.3 1.5.4 2.6.4 2.8 0 4.6-1.4 4.6-3.5 0-1.2-.7-2-2.2-2.8-.9-.5-1.5-.8-1.5-1.2 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.5-2.3.5.2v-.4zm6.8 0h-2.1c-.7 0-1.2.2-1.4.8l-4.1 9.9h2.8l.6-1.6h3.5l.3 1.6h2.5L37.6 10.5zm-3.5 6.8l1.4-3.9.8 3.9h-2.2zM16.8 10.5L14.2 18l-.3-1.4c-.5-1.7-2-3.5-3.7-4.4l2.4 9.1h2.8l4.2-10.8h-2.8z" fill="#1a1f71"/>
                    <path d="M11.6 10.5H7.4l-.1.3c3.4.9 5.6 2.9 6.5 5.4l-.9-4.7c-.2-.8-.7-1-1.3-1z" fill="#f9a533"/>
                  </svg>
                </span>
                {/* Mastercard */}
                <span className="inline-flex items-center rounded border border-white/20 bg-white px-2.5 py-1.5" aria-label="Mastercard">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="h-5 w-8">
                    <rect width="48" height="32" rx="4" fill="#fff"/>
                    <circle cx="19" cy="16" r="8" fill="#eb001b"/>
                    <circle cx="29" cy="16" r="8" fill="#f79e1b"/>
                    <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#ff5f00"/>
                  </svg>
                </span>
                {/* Bank transfer */}
                <span className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-white px-2.5 py-1.5" aria-label={t("bankTransfer")}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="14" rx="2"/>
                    <path d="M2 10h20"/>
                    <path d="M6 14h4"/>
                  </svg>
                  <span className="text-xs font-medium text-brand-primary">{t("bankTransfer")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          &copy; {t("copyright", { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </footer>
  )
}
