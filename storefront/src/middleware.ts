import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"
import { getDomainConfig } from "./i18n/config"

const intlMiddleware = createMiddleware(routing)

/**
 * Middleware: domain-based locale routing + auth guard.
 *
 * Each domain serves exactly one locale (no language switcher).
 * The hostname determines locale, region, and currency.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("x-forwarded-host") || request.headers.get("host") || ""
  const config = getDomainConfig(hostname)

  // Auth guard: account pages require _bs_auth cookie
  // Use localized account paths — check all possible variants
  const accountPaths = ["/ucet", "/account", "/konto"]
  const isAccountPage = accountPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (isAccountPage) {
    const hasAuth = request.cookies.get("_bs_auth")?.value === "1"
    if (!hasAuth) {
      // Redirect to login — use localized path
      const loginPaths: Record<string, string> = {
        en: "/login",
        cs: "/prihlaseni",
        sk: "/prihlaseni",
        pl: "/logowanie",
        de: "/anmelden",
      }
      const loginPath = loginPaths[config.locale] || "/login"
      return NextResponse.redirect(new URL(loginPath, request.url))
    }
  }

  // Let next-intl handle locale resolution from domain
  const response = intlMiddleware(request)

  // Inject domain config as response headers (for server components)
  response.headers.set("x-bs-region", config.region)
  response.headers.set("x-bs-currency", config.currency)
  response.headers.set("x-bs-locale", config.locale)
  response.headers.set("x-bs-store-name", config.storeName)

  return response
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
}
