/**
 * Email sending via Resend API.
 * Falls back to console.log if RESEND_API_KEY is not set.
 */

const RESEND_API_URL = "https://api.resend.com/emails"
const FROM = process.env.RESEND_FROM_EMAIL || "obchod@brightsign.cz"

export interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Core send function. Uses Resend REST API directly (no SDK needed).
 */
export async function sendEmail(opts: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(`[Email - DEV] To: ${opts.to}`)
    console.log(`[Email - DEV] Subject: ${opts.subject}`)
    console.log(`[Email - DEV] (set RESEND_API_KEY to actually send)`)
    return
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo || FROM,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error ${response.status}: ${body}`)
  }
}

// ─── High-level helpers ───────────────────────────────────────────────────────

export async function sendOrderConfirmation(order: {
  id: string
  display_id: number
  email: string
  total: number
  currency_code: string
  items?: Array<{ title: string; quantity: number; unit_price: number }>
}): Promise<void> {
  const { orderConfirmationTemplate } = await import("./email-templates/order-confirmation.js")
  const html = orderConfirmationTemplate(order)
  await sendEmail({
    to: order.email,
    subject: `Potvrzení objednávky #${order.display_id} — BrightSign Shop`,
    html,
  })
}

export async function sendB2BWelcome(
  customer: { email: string; first_name: string; company_name?: string },
  vatStatus: "valid" | "invalid" | "pending"
): Promise<void> {
  const { b2bWelcomeTemplate } = await import("./email-templates/b2b-welcome.js")
  const html = b2bWelcomeTemplate(customer, vatStatus)
  await sendEmail({
    to: customer.email,
    subject: "Vítejte v BrightSign B2B programu",
    html,
  })
}

export async function sendB2BValidated(customer: {
  email: string
  first_name: string
  company_name?: string
}): Promise<void> {
  const { b2bValidatedTemplate } = await import("./email-templates/b2b-validated.js")
  const html = b2bValidatedTemplate(customer)
  await sendEmail({
    to: customer.email,
    subject: "Vaše DIČ bylo ověřeno — aktivní B2B sleva 10%",
    html,
  })
}

export async function sendB2BInquiryAdmin(inquiry: {
  company_name: string
  registration_number: string
  vat_id?: string
  contact_name: string
  email: string
  phone?: string
  message?: string
  vat_status: "valid" | "invalid" | "pending" | "not_provided"
  vat_company_name?: string
  vat_company_address?: string
}): Promise<void> {
  const { b2bInquiryAdminTemplate } = await import("./email-templates/b2b-inquiry-admin.js")
  const html = b2bInquiryAdminTemplate(inquiry)
  const adminEmail = process.env.ADMIN_EMAIL || "obchod@brightsign.cz"
  await sendEmail({
    to: adminEmail,
    subject: `Nová B2B poptávka: ${inquiry.company_name}`,
    html,
    replyTo: inquiry.email,
  })
}

export async function sendB2BInquiryConfirmation(inquiry: {
  contact_name: string
  company_name: string
  email: string
}): Promise<void> {
  const { b2bInquiryConfirmationTemplate } = await import("./email-templates/b2b-inquiry-confirmation.js")
  const html = b2bInquiryConfirmationTemplate(inquiry)
  await sendEmail({
    to: inquiry.email,
    subject: "Děkujeme za poptávku — BrightSign B2B",
    html,
  })
}
