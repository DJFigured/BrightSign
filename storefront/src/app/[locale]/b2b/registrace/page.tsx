'use client'
import { useState } from 'react'

export default function B2BRegistracePage() {
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
          <h1 className="text-2xl font-bold text-[#1a2b4a] mb-4">Žádost odeslána</h1>
          <p className="text-gray-600">Váš zájem o B2B spolupráci jsme přijali. Ozveme se vám do 24 hodin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[#1a2b4a] mb-2">B2B Registrace</h1>
      <p className="text-gray-600 mb-8">Zaregistrujte se jako B2B partner a získejte exkluzivní slevy.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Název firmy *</label>
            <input
              type="text"
              required
              value={form.company}
              onChange={e => setForm({...form, company: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IČO *</label>
            <input
              type="text"
              required
              value={form.ico}
              onChange={e => setForm({...form, ico: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DIČ</label>
            <input
              type="text"
              value={form.dic}
              onChange={e => setForm({...form, dic: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktní osoba *</label>
            <input
              type="text"
              required
              value={form.contactName}
              onChange={e => setForm({...form, contactName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zpráva</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            placeholder="Popište vaše potřeby, typ projektů, odhadovaný objem..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c389]"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#00c389] text-white py-3 rounded-lg font-semibold hover:bg-[#00a872] transition-colors"
        >
          Odeslat žádost o B2B spolupráci
        </button>
      </form>
    </div>
  )
}
