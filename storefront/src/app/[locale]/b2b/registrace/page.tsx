'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function B2BRegistracePage() {
  const t = useTranslations('b2b')
  const [form, setForm] = useState({
    company: '',
    ico: '',
    dic: '',
    contactName: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to backend B2B registration endpoint
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-brand-primary mb-4">{t('successTitle')}</h1>
          <p className="text-muted-foreground">{t('successMessage')}</p>
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
                  value={form.dic}
                  onChange={e => setForm({...form, dic: e.target.value})}
                />
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
            <Button
              type="submit"
              className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white"
              size="lg"
            >
              {t('submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
