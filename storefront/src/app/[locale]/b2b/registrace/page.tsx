'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { trackLead } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

type VatStatus = 'valid' | 'invalid' | 'pending' | 'not_provided'

export default function B2BRegistracePage() {
  const t = useTranslations('b2b')
  const [form, setForm] = useState({
    company: '',
    ico: '',
    dic: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
    website: '', // honeypot
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [vatStatus, setVatStatus] = useState<VatStatus>('not_provided')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${MEDUSA_URL}/store/b2b/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': API_KEY,
        },
        body: JSON.stringify({
          company_name: form.company,
          registration_number: form.ico,
          vat_id: form.dic || undefined,
          contact_name: form.contactName,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message || undefined,
          website: form.website || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('submitError'))
        return
      }

      setVatStatus(data.vat_status)
      setSubmitted(true)
      trackLead('b2b_inquiry', { company: form.company })
    } catch {
      setError(t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-brand-primary mb-4">{t('successTitle')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('inquiryConfirmation', { email: form.email })}
          </p>

          {vatStatus === 'valid' && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
              <span>&#10003;</span> {t('vatValid')}
            </div>
          )}
          {vatStatus === 'pending' && (
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 text-sm font-medium">
              <span>&#8987;</span> {t('vatPending')}
            </div>
          )}
          {vatStatus === 'invalid' && (
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium">
              <span>&#9888;</span> {t('vatInvalid')}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot - hidden from humans */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="b2b-website">Website</label>
              <input
                type="text"
                id="b2b-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('companyName')} *</Label>
                <Input
                  type="text"
                  required
                  value={form.company}
                  onChange={e => setForm({...form, company: e.target.value})}
                />
              </div>
              <div>
                <Label>{t('regNumber')} *</Label>
                <Input
                  type="text"
                  required
                  value={form.ico}
                  onChange={e => setForm({...form, ico: e.target.value})}
                />
              </div>
              <div>
                <Label>{t('vatId')}</Label>
                <Input
                  type="text"
                  placeholder="CZ12345678"
                  value={form.dic}
                  onChange={e => setForm({...form, dic: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('vatHint')}</p>
              </div>
              <div>
                <Label>{t('contactName')} *</Label>
                <Input
                  type="text"
                  required
                  value={form.contactName}
                  onChange={e => setForm({...form, contactName: e.target.value})}
                />
              </div>
              <div>
                <Label>{t('email')} *</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <Label>{t('phone')}</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>{t('message')}</Label>
              <textarea
                rows={4}
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder={t('messagePlaceholder')}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white"
              size="lg"
              disabled={submitting}
            >
              {submitting ? t('submitting') : t('submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
