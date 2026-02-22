import { model } from "@medusajs/framework/utils"

const InvoiceSequence = model.define("invoice_sequence", {
  id: model.id().primaryKey(),
  year: model.number(),
  type: model.text(), // "proforma" | "invoice"
  last_number: model.number().default(0),
})

export default InvoiceSequence
