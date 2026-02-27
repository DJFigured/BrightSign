'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { trackLead, trackPixel } from '@/lib/analytics'
import { CheckCircle } from 'lucide-react'

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

export function ContactPageClient() {
  const t = useTranslations('contactPage')
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // honeypot
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${MEDUSA_URL}/store/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': API_KEY,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || undefined,
          message: form.message,
          website: form.website || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('submitError'))
        return
      }

      setSubmitted(true)
      trackLead('contact_form')
      trackPixel('Lead', { content_name: 'contact_form' })
    } catch {
      setError(t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-brand-accent" />
          <h1 className="text-2xl font-bold text-brand-primary mb-4">
            {t('submitSuccess')}
          </h1>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-brand-primary-dark">
        {t('title')}
      </h1>
      <p className="mb-8 text-muted-foreground">{t('subtitle')}</p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Company Info */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
              {t('companyInfo')}
            </h2>
            <div className="space-y-2 text-foreground/80">
              <p className="font-medium">Make more s.r.o.</p>
              <p>{t('regNumber')}: 21890161</p>
              <p>{t('vatId')}: CZ21890161</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">
              {t('contactDetails')}
            </h2>
            <div className="space-y-2 text-foreground/80">
              <p>
                <span className="font-medium">{t('email')}:</span>{' '}
                <a
                  href="mailto:info@brightsign.cz"
                  className="text-brand-accent hover:underline"
                >
                  info@brightsign.cz
                </a>
              </p>
              <p>
                <span className="font-medium">{t('web')}:</span>{' '}
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
              {t('businessHours')}
            </h2>
            <div className="space-y-1 text-foreground/80">
              <p>{t('weekdays')}</p>
              <p>{t('weekend')}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-brand-primary-dark">
            {t('writeUs')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot - hidden from humans */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                {t('name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
                {t('email')} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                maxLength={254}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-foreground">
                {t('subject')}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                maxLength={200}
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">
                {t('message')} *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                maxLength={5000}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            {error && (
              <div role="alert" className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/90 disabled:opacity-50"
            >
              {submitting ? t('submitting') : t('send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
