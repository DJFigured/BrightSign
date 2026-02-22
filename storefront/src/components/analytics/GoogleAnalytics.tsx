"use client"

import Script from "next/script"

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

/**
 * Google Analytics 4 — direct gtag.js fallback.
 * Only renders if GA_ID is set AND GTM_ID is NOT set.
 * When GTM is active, GA4 should be managed through GTM.
 */
export function GoogleAnalytics() {
  // If GTM is configured, GA4 is managed through GTM
  if (GTM_ID || !GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
            });
            gtag('config', '${GA_ID}', { send_page_view: true });
          `,
        }}
      />
    </>
  )
}
