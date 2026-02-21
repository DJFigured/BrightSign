import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1a2b4a] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
        <p className="text-gray-600 mb-8">{t('description')}</p>
        <Link
          href="/"
          className="bg-[#00c389] text-white px-6 py-3 rounded-lg hover:bg-[#00a872] transition-colors"
        >
          {t('back')}
        </Link>
      </div>
    </div>
  )
}
