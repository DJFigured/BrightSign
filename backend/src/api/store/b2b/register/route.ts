import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { parseVatId, validateVatNumber } from "../../../../lib/vies"
import { checkRateLimit } from "../../../../lib/rate-limit"

/**
 * POST /store/b2b/register
 *
 * B2B customer registration with automatic VIES VAT validation.
 * Assigns customer to b2b_standard (valid) or b2b_pending (VIES unavailable).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    email: string
    password: string
    first_name: string
    last_name: string
    phone: string
    company_name: string
    vat_id: string
    registration_number?: string
    business_type?: "integrator" | "retailer" | "enterprise" | "other"
    expected_volume?: "low" | "medium" | "high"
    website?: string // honeypot
    address?: {
      street: string
      city: string
      postal_code: string
      country_code: string
    }
  }

  // Honeypot — if filled, silently return success (bot trap)
  if (body.website) {
    return res.status(201).json({
      message: "Vaši registraci zpracujeme. Informace obdržíte na zadaný email.",
      vat_status: "pending",
    })
  }

  // Rate limit: 3 requests per 10 minutes per IP
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown"
  if (!checkRateLimit(ip, 3, 600000, "b2b-register")) {
    return res.status(429).json({ error: "Too many requests. Please try again later." })
  }

  // Basic required field check
  const required = ["email", "password", "first_name", "last_name", "phone", "company_name", "vat_id"]
  for (const field of required) {
    if (!body[field as keyof typeof body]) {
      return res.status(400).json({ error: "Vyplňte prosím všechna povinná pole." })
    }
  }

  // Stricter email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(body.email) || body.email.length > 254) {
    return res.status(400).json({ error: "Neplatný formát emailové adresy." })
  }

  // Validate VAT ID format
  const parsed = parseVatId(body.vat_id)
  if (!parsed) {
    return res.status(400).json({
      error: "Neplatný formát DIČ. Zadejte ve formátu CZ12345678.",
      field: "vat_id",
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)

  // Check if email already exists — return same message to prevent user enumeration
  const existing = await customerModuleService.listCustomers({ email: body.email })
  if (existing.length > 0) {
    logger.info(`[B2B] Duplicate registration attempt for ${body.email}`)
    return res.status(201).json({
      message: "Vaši registraci zpracujeme. Informace obdržíte na zadaný email.",
      vat_status: "pending",
    })
  }

  // Attempt VIES validation
  let viesStatus: "valid" | "invalid" | "pending" = "pending"
  let viesResult: { name: string; address: string } | null = null

  try {
    const result = await validateVatNumber(parsed.countryCode, parsed.vatNumber)
    if (result.valid) {
      viesStatus = "valid"
      viesResult = { name: result.name, address: result.address }
      logger.info(`[B2B] VIES valid: ${body.vat_id} → ${result.name}`)
    } else {
      viesStatus = "invalid"
      logger.warn(`[B2B] VIES invalid: ${body.vat_id}`)
    }
  } catch (err: any) {
    // VIES unavailable → pending, grant temp access
    logger.warn(`[B2B] VIES unavailable for ${body.vat_id}: ${err.message}`)
    viesStatus = "pending"
  }

  // Create customer
  const customer = await customerModuleService.createCustomers({
    email: body.email,
    first_name: body.first_name,
    last_name: body.last_name,
    phone: body.phone,
    company_name: body.company_name,
    metadata: {
      vat_id: body.vat_id,
      vat_country: parsed.countryCode,
      vat_number: parsed.vatNumber,
      vat_status: viesStatus,
      vat_company_name: viesResult?.name || "",
      vat_company_address: viesResult?.address || "",
      vat_validated_at: viesStatus === "valid" ? new Date().toISOString() : null,
      registration_number: body.registration_number || "",
      business_type: body.business_type || "other",
      expected_volume: body.expected_volume || "low",
      is_b2b: "true",
    },
  })

  // Assign to customer group based on VIES result
  const groupName = viesStatus === "valid" ? "b2b_standard" : "b2b_pending"

  try {
    const groups = await customerModuleService.listCustomerGroups({ name: groupName })
    if (groups.length > 0) {
      await customerModuleService.addCustomerToGroup({
        customer_id: customer.id,
        customer_group_id: groups[0].id,
      })
      logger.info(`[B2B] Assigned ${customer.email} to group ${groupName}`)
    } else {
      logger.warn(`[B2B] Customer group '${groupName}' not found, skipping assignment`)
    }
  } catch (err: any) {
    logger.warn(`[B2B] Group assignment failed: ${err.message}`)
  }

  return res.status(201).json({
    message: "Vaši registraci zpracujeme. Informace obdržíte na zadaný email.",
    vat_status: viesStatus,
  })
}
