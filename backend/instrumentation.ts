import { initSentry } from "./src/lib/sentry"

// Initialize Sentry error tracking (no-op if SENTRY_DSN is not set)
initSentry()

// Uncomment below to enable OpenTelemetry instrumentation
// Refer to the docs: https://docs.medusajs.com/learn/debugging-and-testing/instrumentation

// import { registerOtel } from "@medusajs/medusa"
// import { ZipkinExporter } from "@opentelemetry/exporter-zipkin"

// const exporter = new ZipkinExporter({
//   serviceName: 'my-medusa-project',
// })

// export function register() {
//   registerOtel({
//     serviceName: 'medusajs',
//     exporter,
//     instrument: {
//       http: true,
//       workflows: true,
//       query: true
//     },
//   })
// }
