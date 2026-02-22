import { model } from "@medusajs/framework/utils"

export const InvoiceType = {
  PROFORMA: "proforma",
  INVOICE: "invoice",
} as const

export const InvoiceStatus = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  CANCELED: "canceled",
} as const

const Invoice = model.define("invoice", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  type: model.text(), // "proforma" | "invoice"
  number: model.text().unique(), // FV2026-0001, ZF2026-0001
  status: model.text().default("draft"), // draft|sent|paid|canceled
  issued_at: model.dateTime(),
  due_at: model.dateTime(),
  paid_at: model.dateTime().nullable(),
  currency_code: model.text(),
  subtotal: model.bigNumber(), // minor units
  tax_total: model.bigNumber(),
  total: model.bigNumber(),
  pdf_url: model.text().nullable(),
  metadata: model.json().nullable(), // billing info, VIES data, VS
})

export default Invoice
