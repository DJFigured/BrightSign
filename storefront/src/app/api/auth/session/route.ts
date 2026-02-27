import { NextResponse } from "next/server"

const COOKIE_NAME = "_bs_auth"
const MAX_AGE = 604800 // 7 days

/** POST /api/auth/session — set HttpOnly auth hint cookie */
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  })
  return res
}

/** DELETE /api/auth/session — clear auth hint cookie */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
  return res
}
