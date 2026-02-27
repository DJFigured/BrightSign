import type { MedusaContainer } from "@medusajs/framework/types"
import { INVOICE_MODULE } from "../modules/invoice"
import { createInvoiceForOrder } from "../lib/invoice-service"
import { sendEmail } from "../lib/email"

/**
 * ČSOB bank statement matching job.
 * Polls IMAP for payment notifications, extracts VS + amount,
 * matches against open proformas, and triggers payment capture.
 *
 * Runs every 15 minutes (configurable via BANK_IMAP_POLL_INTERVAL).
 */
export default async function bankMatchingHandler(container: MedusaContainer) {
  const logger = container.resolve("logger") as any
  const imapHost = process.env.BANK_IMAP_HOST
  const imapUser = process.env.BANK_IMAP_USER
  const imapPass = process.env.BANK_IMAP_PASSWORD

  if (!imapHost || !imapUser || !imapPass) {
    // IMAP not configured — skip silently
    return
  }

  logger.info("[BankMatching] Starting IMAP poll for payment notifications...")

  let Imap: typeof import("imap")
  let simpleParser: typeof import("mailparser").simpleParser

  try {
    Imap = (await import("imap")).default
    const mailparser = await import("mailparser")
    simpleParser = mailparser.simpleParser
  } catch (err: any) {
    logger.error(`[BankMatching] Failed to import imap/mailparser: ${err.message}`)
    return
  }

  const imapPort = parseInt(process.env.BANK_IMAP_PORT || "993", 10)

  return new Promise<void>((resolve) => {
    const imap = new Imap({
      user: imapUser,
      password: imapPass,
      host: imapHost,
      port: imapPort,
      tls: true,
      tlsOptions: { rejectUnauthorized: true },
    })

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err: Error | null) => {
        if (err) {
          logger.error(`[BankMatching] Failed to open inbox: ${err.message}`)
          imap.end()
          resolve()
          return
        }

        // Search for unread payment notification emails
        const searchCriteria = [
          "UNSEEN",
          ["SUBJECT", "Avízo"],
        ]

        imap.search(searchCriteria, (err: Error | null, results: number[]) => {
          if (err || !results || results.length === 0) {
            if (err) logger.error(`[BankMatching] Search error: ${err.message}`)
            else logger.info("[BankMatching] No new payment notifications found")
            imap.end()
            resolve()
            return
          }

          logger.info(`[BankMatching] Found ${results.length} new payment notification(s)`)

          const fetch = imap.fetch(results, { bodies: "", markSeen: true })
          const messages: Promise<void>[] = []

          fetch.on("message", (msg: any) => {
            const messagePromise = new Promise<void>((resolveMsg) => {
              let rawData = ""

              msg.on("body", (stream: any) => {
                stream.on("data", (chunk: Buffer) => {
                  rawData += chunk.toString("utf8")
                })
              })

              msg.once("end", async () => {
                try {
                  const parsed = await simpleParser(rawData)
                  const htmlBody = parsed.html || parsed.textAsHtml || parsed.text || ""
                  const textBody = parsed.text || ""

                  // Extract payment data from ČSOB avízo
                  const paymentData = parseAvizo(htmlBody.toString(), textBody)

                  if (paymentData) {
                    await matchPayment(container, paymentData, logger)
                  } else {
                    logger.info(`[BankMatching] Could not parse payment data from email: ${parsed.subject}`)
                  }
                } catch (parseErr: any) {
                  logger.error(`[BankMatching] Failed to parse email: ${parseErr.message}`)
                }
                resolveMsg()
              })
            })
            messages.push(messagePromise)
          })

          fetch.once("end", async () => {
            await Promise.all(messages)
            imap.end()
            resolve()
          })

          fetch.once("error", (err: Error) => {
            logger.error(`[BankMatching] Fetch error: ${err.message}`)
            imap.end()
            resolve()
          })
        })
      })
    })

    imap.once("error", (err: Error) => {
      logger.error(`[BankMatching] IMAP connection error: ${err.message}`)
      resolve()
    })

    imap.once("end", () => {
      logger.info("[BankMatching] IMAP connection closed")
    })

    imap.connect()
  })
}

// ─── Avízo parser ────────────────────────────────────────────────────────────

interface PaymentData {
  amount: number // minor units
  currency: string
  variable_symbol: string
  date: string
}

function parseAvizo(html: string, text: string): PaymentData | null {
  const content = html || text

  // Try to extract variable symbol (VS) — common patterns in ČSOB avíza
  const vsPatterns = [
    /[Vv]ariabiln[ií]\s*symbol[:\s]*(\d+)/i,
    /VS[:\s]*(\d+)/i,
    /[Ss]ymbol[:\s]*(\d+)/,
  ]
  let vs = ""
  for (const pattern of vsPatterns) {
    const match = content.match(pattern)
    if (match) {
      vs = match[1]
      break
    }
  }

  if (!vs) return null

  // Try to extract amount
  const amountPatterns = [
    /[Čč][áa]stka[:\s]*([\d\s,.]+)\s*(CZK|EUR|PLN|Kč)/i,
    /([\d\s,.]+)\s*(CZK|EUR|PLN|Kč)/i,
    /amount[:\s]*([\d,.]+)/i,
  ]
  let amount = 0
  let currency = "CZK"
  for (const pattern of amountPatterns) {
    const match = content.match(pattern)
    if (match) {
      const amountStr = match[1].replace(/\s/g, "").replace(",", ".")
      amount = Math.round(parseFloat(amountStr) * 100) // convert to minor units
      currency = (match[2] || "CZK").replace("Kč", "CZK")
      break
    }
  }

  if (amount <= 0) return null

  // Try to extract date
  const datePatterns = [
    /(\d{1,2})[./](\d{1,2})[./](\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
  ]
  let date = new Date().toISOString()
  for (const pattern of datePatterns) {
    const match = content.match(pattern)
    if (match) {
      date = match[0]
      break
    }
  }

  return { amount, currency, variable_symbol: vs, date }
}

// ─── Payment matching ────────────────────────────────────────────────────────

async function matchPayment(
  container: MedusaContainer,
  payment: PaymentData,
  logger: any
): Promise<void> {
  const invoiceModule = container.resolve(INVOICE_MODULE) as any
  const orderModule = container.resolve("order") as any

  logger.info(
    `[BankMatching] Trying to match VS=${payment.variable_symbol}, amount=${payment.amount/100} ${payment.currency}`
  )

  // Find unpaid proformas matching the variable symbol
  const invoices = await invoiceModule.listInvoices({
    type: "proforma",
    status: ["draft", "sent"],
  })

  const matchedInvoice = invoices.find((inv: any) => {
    const meta = inv.metadata || {}
    return meta.variable_symbol === payment.variable_symbol
  })

  if (!matchedInvoice) {
    logger.info(`[BankMatching] No matching proforma found for VS=${payment.variable_symbol}`)

    // Notify admin about unmatched payment
    const adminEmail = process.env.ADMIN_EMAIL || "obchod@brightsign.cz"
    await sendEmail({
      to: adminEmail,
      subject: `Nespárovaná platba — VS ${payment.variable_symbol}`,
      html: `<p>Přijata platba, ale nebyla spárována s žádnou objednávkou.</p>
<p>VS: <strong>${payment.variable_symbol}</strong></p>
<p>Částka: <strong>${(payment.amount / 100).toFixed(2)} ${payment.currency}</strong></p>
<p>Datum: ${payment.date}</p>
<p>Zkontrolujte prosím v administraci.</p>`,
    }).catch(() => {})
    return
  }

  logger.info(`[BankMatching] Matched VS=${payment.variable_symbol} → invoice ${matchedInvoice.number}`)

  // Mark proforma as paid
  const paidAt = new Date()
  await invoiceModule.updateInvoices(matchedInvoice.id, {
    status: "paid",
    paid_at: paidAt,
  })

  // Generate final invoice
  try {
    const order = await orderModule.retrieveOrder(matchedInvoice.order_id, {
      relations: ["items", "shipping_address"],
    })

    await createInvoiceForOrder(container, {
      id: order.id,
      display_id: order.display_id ?? null,
      email: order.email || "",
      currency_code: order.currency_code || "CZK",
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      total: order.total,
      items: order.items,
      shipping_address: order.shipping_address,
      metadata: order.metadata,
    })

    logger.info(`[BankMatching] Final invoice generated for order #${order.display_id}`)
  } catch (err: any) {
    logger.error(`[BankMatching] Failed to generate final invoice: ${err.message}`)
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL || "obchod@brightsign.cz"
  await sendEmail({
    to: adminEmail,
    subject: `Platba spárována — objednávka ${matchedInvoice.number}`,
    html: `<p>Automaticky spárovaná platba:</p>
<p>VS: <strong>${payment.variable_symbol}</strong></p>
<p>Částka: <strong>${(payment.amount / 100).toFixed(2)} ${payment.currency}</strong></p>
<p>Faktura: ${matchedInvoice.number}</p>
<p>Objednávka bude odeslána.</p>`,
  }).catch(() => {})
}

// ─── Job config ──────────────────────────────────────────────────────────────

export const config = {
  name: "bank-matching",
  // Every 15 minutes
  schedule: "*/15 * * * *",
}
