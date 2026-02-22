import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage")
  return { title: t("title") }
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage")

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-brand-primary-dark">
        {t("title")}
      </h1>
      <p className="mb-8 text-text-gray-600">{t("subtitle")}</p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Company Info */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
              {t("companyInfo")}
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">Make more s.r.o.</p>
              <p>{t("regNumber")}: 21890161</p>
              <p>{t("vatId")}: CZ21890161</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
              {t("contactDetails")}
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">{t("email")}:</span>{" "}
                <a
                  href="mailto:info@brightsign.cz"
                  className="text-brand-accent hover:underline"
                >
                  info@brightsign.cz
                </a>
              </p>
              <p>
                <span className="font-medium">{t("web")}:</span>{" "}
                <a
                  href="https://brightsign.cz"
                  className="text-brand-accent hover:underline"
                >
                  brightsign.cz
                </a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
              {t("businessHours")}
            </h2>
            <div className="space-y-1 text-gray-700">
              <p>{t("weekdays")}</p>
              <p>{t("weekend")}</p>
            </div>
          </div>
        </div>

        {/* Contact Form (mailto-based) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-brand-primary-dark">
            {t("writeUs")}
          </h2>
          <form
            action="mailto:info@brightsign.cz"
            method="POST"
            encType="text/plain"
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
                {t("subject")}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/90"
            >
              {t("send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
