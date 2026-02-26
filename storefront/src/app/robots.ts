import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brightsign.cz"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        "/*/kosik",
        "/*/pokladna",
        "/*/ucet",
        "/*/prihlaseni",
        "/*/registrace",
        "/*/hledani",
        "/*/porovnani",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
