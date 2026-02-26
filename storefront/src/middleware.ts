import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"
import { locales } from "./i18n/config"

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is an account page (any locale prefix + /ucet)
  const isAccountPage = locales.some(
    (locale) => pathname === `/${locale}/ucet` || pathname.startsWith(`/${locale}/ucet/`)
  )

  if (isAccountPage) {
    const hasAuth = request.cookies.get("_bs_auth")?.value === "1"
    if (!hasAuth) {
      // Extract locale from path
      const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || "cs"
      const loginUrl = new URL(`/${locale}/prihlaseni`, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
