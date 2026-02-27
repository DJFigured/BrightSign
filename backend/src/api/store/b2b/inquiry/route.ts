import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { parseVatId, validateVatNumber } from "../../../../lib/vies"
import { sendB2BInquiryAdmin, sendB2BInquiryConfirmation } from "../../../../lib/email"
import { checkRateLimit } from "../../../../lib/rate-limit"

/**
 * POST /store/b2b/inquiry
 *
 * Lightweight B2B inquiry endpoint — no account creation.
 * Validates VAT via VIES (if provided), sends admin notification + customer confirmation.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    company_name: string
    registration_number: string
    vat_id?: string
    contact_name: string
    email: string
    phone?: string
    message?: string
    website?: string // honeypot
  }

  // Honeypot — if filled, silently return success (bot trap)
  if (body.website) {
    return res.status(201).json({ success: true, vat_status: "not_provided" })
  }

  // Rate limit: 5 requests per hour per IP
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown"
  if (!checkRateLimit(ip, 5, 3600000, "b2b-inquiry")) {
    return res.status(429).json({ error: "Too many requests. Please try again later." })
  }

  // Required fields
  if (!body.company_name || !body.contact_name || !body.email) {
    return res.status(400).json({
      error: "Missing required fields: company_name, contact_name, email",
    })
  }

  // Stricter email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(body.email) || body.email.length > 254) {
    return res.status(400).json({ error: "Invalid email format" })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // VIES validation (if VAT ID provided)
  let vatStatus: "valid" | "invalid" | "pending" | "not_provided" = "not_provided"
  let vatCompanyName = ""
  let vatCompanyAddress = ""

  if (body.vat_id && body.vat_id.trim()) {
    const parsed = parseVatId(body.vat_id)
    if (!parsed) {
      return res.status(400).json({
        error: "Invalid VAT ID format. Use format: CZ12345678",
        field: "vat_id",
      })
    }

    try {
      const result = await validateVatNumber(parsed.countryCode, parsed.vatNumber)
      if (result.valid) {
        vatStatus = "valid"
        vatCompanyName = result.name
        vatCompanyAddress = result.address
        logger.info(`[B2B Inquiry] VIES valid: ${body.vat_id} → ${result.name}`)
      } else {
        vatStatus = "invalid"
        logger.warn(`[B2B Inquiry] VIES invalid: ${body.vat_id}`)
      }
    } catch (err: any) {
      vatStatus = "pending"
      logger.warn(`[B2B Inquiry] VIES unavailable for ${body.vat_id}: ${err.message}`)
    }
  }

  // Prepare inquiry data for emails
  const inquiryData = {
    company_name: body.company_name,
    registration_number: body.registration_number || "",
    vat_id: body.vat_id?.trim() || undefined,
    contact_name: body.contact_name,
    email: body.email,
    phone: body.phone || undefined,
    message: body.message || undefined,
    vat_status: vatStatus,
    vat_company_name: vatCompanyName || undefined,
    vat_company_address: vatCompanyAddress || undefined,
  }

  // Send emails (non-blocking — don't fail the request if email fails)
  try {
    await Promise.all([
      sendB2BInquiryAdmin(inquiryData),
      sendB2BInquiryConfirmation({
        contact_name: body.contact_name,
        company_name: body.company_name,
        email: body.email,
      }),
    ])
    logger.info(`[B2B Inquiry] Emails sent for ${body.company_name} (${body.email})`)
  } catch (err: any) {
    logger.error(`[B2B Inquiry] Email send failed: ${err.message}`)
  }

  return res.status(201).json({
    success: true,
    vat_status: vatStatus,
  })
}
