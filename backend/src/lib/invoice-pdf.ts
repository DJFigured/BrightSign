/**
 * Invoice PDF generator using pdfmake.
 * Generates Czech-compliant invoices (daňový doklad) and proformas (zálohová faktura).
 */
import PdfMake from "pdfmake"
// pdfmake CJS default export
const PdfPrinter = (PdfMake as any).default || PdfMake
import type { TDocumentDefinitions, Content, StyleDictionary } from "pdfmake/interfaces"
import QRCode from "qrcode"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceData {
  type: "proforma" | "invoice"
  number: string // FV2026-0001 or ZF2026-0001
  issued_at: Date
  due_at: Date
  paid_at?: Date | null
  currency_code: string // CZK, EUR, PLN
  variable_symbol: string // = order display_id

  // Supplier (fixed)
  supplier: {
    name: string
    address: string
    ico: string
    dic: string
    bank_name: string
    account_number: string
    iban: string
    bic: string
  }

  // Customer
  customer: {
    name: string
    address: string
    ico?: string
    dic?: string
    email?: string
  }

  // Line items
  items: Array<{
    title: string
    quantity: number
    unit_price: number // minor units (halere/cents)
    tax_rate: number // 21, 0, etc.
  }>

  subtotal: number // minor units
  tax_total: number // minor units
  total: number // minor units

  // Reverse charge
  reverse_charge: boolean
  reverse_charge_text?: string

  // Notes
  notes?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMoney(amountMinor: number, currency: string): string {
  const amount = amountMinor / 100
  const formatted = amount.toLocaleString("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${currency.toUpperCase()}`
}

function formatDate(date: Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("cs-CZ")
}

/**
 * Generate SPAYD QR payment string for Czech banks.
 * Format: SPD*1.0*ACC:CZ1234567890*AM:100.00*CC:CZK*X-VS:12345*MSG:text
 */
function generateSpayd(data: {
  iban: string
  amount: number // major units (e.g. 100.00)
  currency: string
  vs: string
  message?: string
}): string {
  const parts = [
    "SPD*1.0",
    `ACC:${data.iban}`,
    `AM:${data.amount.toFixed(2)}`,
    `CC:${data.currency.toUpperCase()}`,
    `X-VS:${data.vs}`,
  ]
  if (data.message) {
    parts.push(`MSG:${data.message.substring(0, 60)}`)
  }
  return parts.join("*")
}

// ─── PDF Generator ──────────────────────────────────────────────────────────

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const printer = new (PdfPrinter as any)(fonts)

  const title = data.type === "invoice" ? "Faktura - Daňový doklad" : "Zálohová faktura (proforma)"

  // Generate QR code for bank payment
  let qrDataUrl: string | null = null
  if (data.supplier.iban && data.total > 0) {
    const spayd = generateSpayd({
      iban: data.supplier.iban,
      amount: data.total / 100,
      currency: data.currency_code,
      vs: data.variable_symbol,
      message: `Faktura ${data.number}`,
    })
    try {
      qrDataUrl = await QRCode.toDataURL(spayd, { width: 120, margin: 1 })
    } catch {
      // QR generation failed, skip it
    }
  }

  // Build items table
  const itemRows: Content[][] = data.items.map((item, i) => [
    { text: String(i + 1), style: "tableCell" },
    { text: item.title, style: "tableCell" },
    { text: String(item.quantity), style: "tableCell", alignment: "center" as const },
    { text: formatMoney(item.unit_price, data.currency_code), style: "tableCell", alignment: "right" as const },
    { text: `${item.tax_rate}%`, style: "tableCell", alignment: "center" as const },
    { text: formatMoney(item.unit_price * item.quantity, data.currency_code), style: "tableCell", alignment: "right" as const },
  ])

  const styles: StyleDictionary = {
    header: { fontSize: 18, bold: true, color: "#1a2b4a" },
    subheader: { fontSize: 11, bold: true, color: "#1a2b4a", margin: [0, 10, 0, 4] },
    tableHeader: { fontSize: 9, bold: true, color: "#ffffff", fillColor: "#1a2b4a" },
    tableCell: { fontSize: 9 },
    small: { fontSize: 8, color: "#666666" },
    label: { fontSize: 9, color: "#666666" },
    value: { fontSize: 9, bold: true },
    total: { fontSize: 12, bold: true, color: "#1a2b4a" },
    reverseCharge: { fontSize: 9, italics: true, color: "#cc6600" },
  }

  const docDefinition: TDocumentDefinitions = {
    defaultStyle: { font: "Helvetica", fontSize: 10 },
    pageSize: "A4",
    pageMargins: [40, 40, 40, 60],
    styles,
    content: [
      // Header
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: title, style: "header" },
              { text: `Číslo dokladu: ${data.number}`, style: "label", margin: [0, 6, 0, 0] },
            ],
          },
          {
            width: 100,
            stack: [
              { text: "BrightSign", fontSize: 14, bold: true, color: "#00c389", alignment: "right" as const },
              { text: "brightsign.cz", fontSize: 8, color: "#666666", alignment: "right" as const },
            ],
          },
        ],
      },

      { text: "", margin: [0, 10, 0, 0] },

      // Dates row
      {
        columns: [
          { text: `Datum vystavení: ${formatDate(data.issued_at)}`, style: "small" },
          { text: `Datum splatnosti: ${formatDate(data.due_at)}`, style: "small" },
          data.paid_at
            ? { text: `Datum zaplacení: ${formatDate(data.paid_at)}`, style: "small" }
            : { text: "" },
        ],
      },

      { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: "#cccccc" }] },

      // Supplier & Customer
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Dodavatel", style: "subheader" },
              { text: data.supplier.name, style: "value" },
              { text: data.supplier.address, style: "small" },
              { text: `IČO: ${data.supplier.ico}`, style: "small", margin: [0, 4, 0, 0] },
              { text: `DIČ: ${data.supplier.dic}`, style: "small" },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "Odběratel", style: "subheader" },
              { text: data.customer.name, style: "value" },
              { text: data.customer.address, style: "small" },
              ...(data.customer.ico ? [{ text: `IČO: ${data.customer.ico}`, style: "small" as const, margin: [0, 4, 0, 0] as [number, number, number, number] }] : []),
              ...(data.customer.dic ? [{ text: `DIČ: ${data.customer.dic}`, style: "small" as const }] : []),
              ...(data.customer.email ? [{ text: `E-mail: ${data.customer.email}`, style: "small" as const }] : []),
            ],
          },
        ],
      },

      { text: "", margin: [0, 10, 0, 0] },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: [25, "*", 40, 80, 40, 90],
          body: [
            [
              { text: "#", style: "tableHeader" },
              { text: "Položka", style: "tableHeader" },
              { text: "Ks", style: "tableHeader", alignment: "center" as const },
              { text: "Cena/ks", style: "tableHeader", alignment: "right" as const },
              { text: "DPH", style: "tableHeader", alignment: "center" as const },
              { text: "Celkem", style: "tableHeader", alignment: "right" as const },
            ],
            ...itemRows,
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#dddddd",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },

      { text: "", margin: [0, 8, 0, 0] },

      // Totals
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 220,
            stack: [
              {
                columns: [
                  { text: "Základ:", style: "label", width: 120 },
                  { text: formatMoney(data.subtotal, data.currency_code), style: "value", alignment: "right" as const },
                ],
              },
              {
                columns: [
                  { text: data.reverse_charge ? "DPH (reverse charge):" : "DPH:", style: "label", width: 120 },
                  { text: formatMoney(data.tax_total, data.currency_code), style: "value", alignment: "right" as const },
                ],
              },
              { canvas: [{ type: "line", x1: 0, y1: 2, x2: 220, y2: 2, lineWidth: 1, lineColor: "#1a2b4a" }] },
              {
                columns: [
                  { text: "Celkem k úhradě:", style: "total", width: 120, margin: [0, 4, 0, 0] },
                  { text: formatMoney(data.total, data.currency_code), style: "total", alignment: "right" as const, margin: [0, 4, 0, 0] },
                ],
              },
            ],
          },
        ],
      },

      // Reverse charge notice
      ...(data.reverse_charge && data.reverse_charge_text
        ? [
            { text: "", margin: [0, 8, 0, 0] as [number, number, number, number] },
            { text: data.reverse_charge_text, style: "reverseCharge" } as Content,
          ]
        : []),

      { text: "", margin: [0, 16, 0, 0] },

      // Payment info + QR
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "Platební údaje", style: "subheader" },
              { text: `Banka: ${data.supplier.bank_name}`, style: "small" },
              { text: `Číslo účtu: ${data.supplier.account_number}`, style: "small" },
              ...(data.supplier.iban ? [{ text: `IBAN: ${data.supplier.iban}`, style: "small" as const }] : []),
              ...(data.supplier.bic ? [{ text: `BIC/SWIFT: ${data.supplier.bic}`, style: "small" as const }] : []),
              { text: `Variabilní symbol: ${data.variable_symbol}`, style: "value", margin: [0, 4, 0, 0] },
            ],
          },
          ...(qrDataUrl
            ? [
                {
                  width: 130,
                  stack: [
                    { text: "QR platba", style: "subheader" as const, alignment: "center" as const },
                    { image: qrDataUrl, width: 100, alignment: "center" as const },
                  ] as Content[],
                },
              ]
            : []),
        ],
      },

      // Notes
      ...(data.notes
        ? [
            { text: "", margin: [0, 12, 0, 0] as [number, number, number, number] },
            { text: "Poznámka", style: "subheader" } as Content,
            { text: data.notes, style: "small" } as Content,
          ]
        : []),
    ],
    footer: {
      columns: [
        {
          text: `${data.supplier.name} | IČO: ${data.supplier.ico} | DIČ: ${data.supplier.dic} | ${data.supplier.address}`,
          style: "small",
          alignment: "center",
          margin: [40, 0, 40, 0],
        },
      ],
    },
  }

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Buffer[] = []
    pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk))
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)))
    pdfDoc.on("error", reject)
    pdfDoc.end()
  })
}

// ─── Supplier defaults ──────────────────────────────────────────────────────

export function getSupplierInfo(currencyCode: string) {
  const isCZK = currencyCode?.toUpperCase() === "CZK"
  return {
    name: process.env.INVOICE_COMPANY_NAME || "FIGURED s.r.o.",
    address: process.env.INVOICE_COMPANY_ADDRESS || "Nová 1886/17, České Budějovice 3, 370 01 České Budějovice",
    ico: process.env.INVOICE_ICO || "06809791",
    dic: process.env.INVOICE_DIC || "CZ06809791",
    bank_name: "ČSOB",
    account_number: isCZK
      ? (process.env.INVOICE_ACCOUNT_CZK || "335584589/0300")
      : (process.env.INVOICE_ACCOUNT_EUR || "335645089/0300"),
    iban: isCZK
      ? (process.env.INVOICE_IBAN_CZK || "")
      : (process.env.INVOICE_IBAN_EUR || ""),
    bic: "CEKOCZPP",
  }
}
