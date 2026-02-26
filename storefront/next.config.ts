import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Production: MinIO object storage and API
      { protocol: "https", hostname: "minio.brightsign.cz" },
      { protocol: "https", hostname: "api.brightsign.cz" },
      // BrightSign official CDN (for any external product images)
      { protocol: "https", hostname: "**.brightsign.biz" },
      // Dev: local Medusa backend + MinIO
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
}

export default withNextIntl(nextConfig)
