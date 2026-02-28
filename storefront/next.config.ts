import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Production: MinIO object storage and API
      { protocol: "https", hostname: "minio.brightsign.cz" },
      { protocol: "https", hostname: "api.brightsign.cz" },
      { protocol: "https", hostname: "minio.ebrightsign.eu" },
      { protocol: "https", hostname: "api.ebrightsign.eu" },
      // BrightSign official CDN (for any external product images)
      { protocol: "https", hostname: "**.brightsign.biz" },
      // Dev: local Medusa backend + MinIO
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://minio.brightsign.cz https://api.brightsign.cz https://minio.ebrightsign.eu https://api.ebrightsign.eu https://*.brightsign.biz https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com",
              "connect-src 'self' https://api.brightsign.cz https://api.ebrightsign.eu https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com https://*.sentry.io https://connect.facebook.net https://www.facebook.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(withNextIntl(nextConfig), {
  // Disable source map upload (no auth token configured yet)
  sourcemaps: {
    disable: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Disable the Sentry build-time logger
  silent: true,
})
