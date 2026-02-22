import { MedusaService } from "@medusajs/framework/utils"
import Invoice from "./models/invoice"
import InvoiceSequence from "./models/invoice-sequence"

class InvoiceModuleService extends MedusaService({
  Invoice,
  InvoiceSequence,
}) {
  /**
   * Get next invoice number atomically.
   * Returns "FV2026-0001" for invoices, "ZF2026-0001" for proformas.
   */
  async getNextNumber(type: "proforma" | "invoice", year?: number): Promise<string> {
    const currentYear = year ?? new Date().getFullYear()
    const prefix = type === "invoice" ? "FV" : "ZF"

    // Try to find existing sequence
    const sequences = await this.listInvoiceSequences({
      year: currentYear,
      type,
    })

    let seq = sequences[0]

    if (!seq) {
      // Create new sequence for this year/type
      seq = await this.createInvoiceSequences({
        year: currentYear,
        type,
        last_number: 0,
      })
    }

    // Increment — use selector+data pattern for Medusa v2 service factory
    const nextNum = (seq.last_number ?? 0) + 1
    await this.updateInvoiceSequences({
      selector: { id: seq.id },
      data: { last_number: nextNum },
    })

    const paddedNum = String(nextNum).padStart(4, "0")
    return `${prefix}${currentYear}-${paddedNum}`
  }
}

export default InvoiceModuleService
