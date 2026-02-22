/**
 * Invoice business logic — creates proformas and invoices, generates PDFs,
 * uploads to S3/local, and sends emails.
 */
import type { MedusaContainer } from "@medusajs/framework/types"
import { generateInvoicePdf, getSupplierInfo } from "./invoice-pdf"
import type { InvoiceData } from "./invoice-pdf"
import { INVOICE_MODULE } from "../modules/invoice"
import { sendEmail } from "./email"

// ─── Types ──────────────────────────────────────────────────────────────────

interface OrderForInvoice {
  id: string
  display_id: number | null
  email: string
  currency_code: string
  subtotal: number | unknown
  tax_total: number | unknown
  total: number | unknown
  items?: Array<{
    title?: string | null
    product_title?: string | null
    quantity: number
    unit_price: number | unknown
  }>
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    company?: string | null
    address_1?: string | null
    city?: string | null
    postal_code?: string | null
    country_code?: string | null
  } | null
  metadata?: Record<string, unknown> | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toNumber(val: unknown): number {
  if (typeof val === "number") return val
  if (typeof val === "string") return parseFloat(val) || 0
  if (val && typeof val === "object" && "value" in val) return Number((val as { value: unknown }).value) || 0
  return Number(val) || 0
}

function buildCustomerInfo(order: OrderForInvoice) {
  const addr = order.shipping_address
  const meta = (order.metadata || {}) as Record<string, unknown>
  const parts: string[] = []
  if (addr?.address_1) parts.push(addr.address_1)
  if (addr?.city || addr?.postal_code) {
    parts.push(`${addr?.postal_code || ""} ${addr?.city || ""}`.trim())
  }
  if (addr?.country_code) parts.push(addr.country_code.toUpperCase())

  return {
    name: (meta.company_name as string)
      || (addr?.company || "")
      || `${addr?.first_name || ""} ${addr?.last_name || ""}`.trim()
      || order.email,
    address: parts.join(", ") || "",
    ico: (meta.ico as string) || undefined,
    dic: (meta.dic as string) || (meta.vat_id as string) || undefined,
    email: order.email,
  }
}

function isReverseCharge(order: OrderForInvoice): boolean {
  const meta = (order.metadata || {}) as Record<string, unknown>
  // Reverse charge if: B2B with valid VIES + not domestic (CZ)
  if (meta.vat_status !== "valid") return false
  const dic = (meta.dic as string) || (meta.vat_id as string) || ""
  // Domestic CZ sales have normal DPH
  if (dic.startsWith("CZ")) return false
  return true
}

// ─── Main functions ─────────────────────────────────────────────────────────

export async function createProformaForOrder(
  container: MedusaContainer,
  order: OrderForInvoice
): Promise<{ invoiceId: string; pdfUrl: string; number: string }> {
  return createInvoiceDocument(container, order, "proforma")
}

export async function createInvoiceForOrder(
  container: MedusaContainer,
  order: OrderForInvoice
): Promise<{ invoiceId: string; pdfUrl: string; number: string }> {
  return createInvoiceDocument(container, order, "invoice")
}

async function createInvoiceDocument(
  container: MedusaContainer,
  order: OrderForInvoice,
  type: "proforma" | "invoice"
): Promise<{ invoiceId: string; pdfUrl: string; number: string }> {
  const logger = container.resolve("logger") as { info: (...args: unknown[]) => void; error: (...args: unknown[]) => void }
  const invoiceModule = container.resolve(INVOICE_MODULE) as {
    getNextNumber: (type: string, year?: number) => Promise<string>
    createInvoices: (data: Record<string, unknown>) => Promise<{ id: string }>
    updateInvoices: (id: string, data: Record<string, unknown>) => Promise<unknown>
  }

  // Generate invoice number
  const invoiceNumber = await invoiceModule.getNextNumber(type)
  logger.info(`[Invoice] Generating ${type} ${invoiceNumber} for order #${order.display_id}`)

  const now = new Date()
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + (type === "proforma" ? 7 : 14))

  const currencyCode = order.currency_code || "CZK"
  const supplier = getSupplierInfo(currencyCode)
  const customer = buildCustomerInfo(order)
  const reverseCharge = isReverseCharge(order)

  const subtotal = toNumber(order.subtotal)
  const taxTotal = reverseCharge ? 0 : toNumber(order.tax_total)
  const total = reverseCharge ? subtotal : toNumber(order.total)

  const items = (order.items || []).map((item) => ({
    title: item.title || item.product_title || "Produkt",
    quantity: item.quantity,
    unit_price: toNumber(item.unit_price),
    tax_rate: reverseCharge ? 0 : 21,
  }))

  const variableSymbol = String(order.display_id || order.id.slice(-8))

  // Generate PDF
  const invoiceData: InvoiceData = {
    type,
    number: invoiceNumber,
    issued_at: now,
    due_at: dueDate,
    paid_at: type === "invoice" ? now : null,
    currency_code: currencyCode,
    variable_symbol: variableSymbol,
    supplier,
    customer,
    items,
    subtotal,
    tax_total: taxTotal,
    total,
    reverse_charge: reverseCharge,
    reverse_charge_text: reverseCharge
      ? "Daň odvede zákazník (reverse charge, §92a zákona o DPH / Article 196 Council Directive 2006/112/EC)"
      : undefined,
  }

  const pdfBuffer = await generateInvoicePdf(invoiceData)

  // Upload PDF to file storage
  let pdfUrl = ""
  try {
    const fileModule = container.resolve("file") as {
      createFiles: (data: { filename: string; mimeType: string; content: string }[]) => Promise<{ id: string; url: string }[]>
    }
    const files = await fileModule.createFiles([{
      filename: `invoices/${invoiceNumber}.pdf`,
      mimeType: "application/pdf",
      content: pdfBuffer.toString("base64"),
    }])
    pdfUrl = files[0]?.url || ""
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    logger.error(`[Invoice] Failed to upload PDF: ${errMsg}`)
    // Fallback: save locally and serve via /uploads
    const fs = await import("fs")
    const path = await import("path")
    const uploadsDir = path.join(process.cwd(), "uploads", "invoices")
    fs.mkdirSync(uploadsDir, { recursive: true })
    const filePath = path.join(uploadsDir, `${invoiceNumber}.pdf`)
    fs.writeFileSync(filePath, pdfBuffer)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:9000"
    pdfUrl = `${backendUrl}/uploads/invoices/${invoiceNumber}.pdf`
  }

  // Create invoice record in DB
  const invoice = await invoiceModule.createInvoices({
    order_id: order.id,
    type,
    number: invoiceNumber,
    status: type === "invoice" ? "paid" : "sent",
    issued_at: now,
    due_at: dueDate,
    paid_at: type === "invoice" ? now : null,
    currency_code: currencyCode,
    subtotal,
    tax_total: taxTotal,
    total,
    pdf_url: pdfUrl,
    metadata: {
      variable_symbol: variableSymbol,
      customer_name: customer.name,
      customer_dic: customer.dic || null,
      reverse_charge: reverseCharge,
    },
  })

  // Send email with invoice
  if (order.email) {
    const docName = type === "invoice" ? "Faktura" : "Zálohová faktura"
    await sendEmail({
      to: order.email,
      subject: `${docName} ${invoiceNumber} — BrightSign Shop`,
      html: invoiceEmailTemplate({
        docName,
        invoiceNumber,
        total: `${(total / 100).toFixed(2)} ${currencyCode.toUpperCase()}`,
        dueDate: dueDate.toLocaleDateString("cs-CZ"),
        pdfUrl,
        variableSymbol,
        isBankTransfer: type === "proforma",
        supplier,
      }),
    }).catch((err: unknown) => {
      const errMsg = err instanceof Error ? err.message : String(err)
      logger.error(`[Invoice Email] Failed: ${errMsg}`)
    })
  }

  return { invoiceId: invoice.id, pdfUrl, number: invoiceNumber }
}

export async function markInvoiceAsPaid(
  container: MedusaContainer,
  invoiceId: string,
  paidAt?: Date
): Promise<void> {
  const invoiceModule = container.resolve(INVOICE_MODULE) as {
    updateInvoices: (id: string, data: Record<string, unknown>) => Promise<unknown>
    retrieveInvoice: (id: string) => Promise<{ id: string; order_id: string; type: string }>
  }
  const logger = container.resolve("logger") as { info: (...args: unknown[]) => void }

  await invoiceModule.updateInvoices(invoiceId, {
    status: "paid",
    paid_at: paidAt || new Date(),
  })

  logger.info(`[Invoice] Marked ${invoiceId} as paid`)
}

// ─── Email template ─────────────────────────────────────────────────────────

function invoiceEmailTemplate(data: {
  docName: string
  invoiceNumber: string
  total: string
  dueDate: string
  pdfUrl: string
  variableSymbol: string
  isBankTransfer: boolean
  supplier: { name: string; account_number: string; iban: string; bank_name: string }
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a2b4a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">${data.docName} ${data.invoiceNumber}</h1>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p>Dobrý den,</p>
    <p>${data.isBankTransfer
      ? "zasíláme vám zálohovou fakturu k vaší objednávce. Po přijetí platby vám zašleme finální fakturu a odešleme zboží."
      : "zasíláme vám fakturu k vaší objednávce."
    }</p>

    <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">Číslo dokladu:</td>
        <td style="padding: 8px 0; font-weight: bold;">${data.invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Celkem k úhradě:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #1a2b4a;">${data.total}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Splatnost:</td>
        <td style="padding: 8px 0;">${data.dueDate}</td>
      </tr>
      ${data.isBankTransfer ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Variabilní symbol:</td>
        <td style="padding: 8px 0; font-weight: bold;">${data.variableSymbol}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Číslo účtu:</td>
        <td style="padding: 8px 0;">${data.supplier.account_number} (${data.supplier.bank_name})</td>
      </tr>
      ${data.supplier.iban ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">IBAN:</td>
        <td style="padding: 8px 0;">${data.supplier.iban}</td>
      </tr>` : ""}
      ` : ""}
    </table>

    ${data.pdfUrl ? `
    <p>
      <a href="${data.pdfUrl}" style="display: inline-block; background: #00c389; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Stáhnout PDF
      </a>
    </p>` : ""}

    <p style="color: #999; font-size: 12px; margin-top: 24px;">
      ${data.supplier.name} | brightsign.cz
    </p>
  </div>
</body>
</html>`
}
