import * as Sentry from "@sentry/node"

const dsn = process.env.SENTRY_DSN

let initialized = false

export function initSentry() {
  if (initialized || !dsn) {
    return
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV || "development",
  })

  initialized = true
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) {
    return
  }

  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context)
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

export { Sentry }
