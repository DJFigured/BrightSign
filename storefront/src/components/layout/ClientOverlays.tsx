"use client"

import dynamic from "next/dynamic"

const CompareBar = dynamic(() => import("@/components/product/CompareBar").then((m) => m.CompareBar), { ssr: false })
const CookieConsent = dynamic(() => import("@/components/analytics/CookieConsent").then((m) => m.CookieConsent), { ssr: false })
const BackToTop = dynamic(() => import("@/components/ui/BackToTop").then((m) => m.BackToTop), { ssr: false })
const CartToast = dynamic(() => import("@/components/ui/CartToast").then((m) => m.CartToast), { ssr: false })

export function ClientOverlays() {
  return (
    <>
      <CompareBar />
      <CartToast />
      <BackToTop />
    </>
  )
}

export function ClientCookieConsent() {
  return <CookieConsent />
}
