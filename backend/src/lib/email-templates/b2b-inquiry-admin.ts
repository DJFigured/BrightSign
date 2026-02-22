/**
 * B2B inquiry admin notification email template
 */

export interface B2BInquiryData {
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
}

export function b2bInquiryAdminTemplate(inquiry: B2BInquiryData): string {
  const vatBadge = {
    valid: `<span style="display:inline-block;background:#00c389;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">&#10003; VIES ov&#283;&#345;eno</span>`,
    invalid: `<span style="display:inline-block;background:#ef4444;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">&#9888; VIES neov&#283;&#345;eno</span>`,
    pending: `<span style="display:inline-block;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">&#8987; VIES nedostupn&yacute;</span>`,
    not_provided: `<span style="display:inline-block;background:#6b7280;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">&#8212; DI&#268; neuvedeno</span>`,
  }

  const vatRow = inquiry.vat_id
    ? `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;width:140px;">DI&#268;</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${inquiry.vat_id} ${vatBadge[inquiry.vat_status]}</td>
      </tr>`
    : `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;width:140px;">DI&#268;</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${vatBadge.not_provided}</td>
      </tr>`

  const viesInfoRow =
    inquiry.vat_status === "valid" && (inquiry.vat_company_name || inquiry.vat_company_address)
      ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">VIES data</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">
            ${inquiry.vat_company_name ? `<strong>${inquiry.vat_company_name}</strong><br>` : ""}
            ${inquiry.vat_company_address || ""}
          </td>
        </tr>`
      : ""

  const messageRow = inquiry.message
    ? `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;vertical-align:top;">Zpr&aacute;va</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;white-space:pre-wrap;">${inquiry.message}</td>
      </tr>`
    : ""

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nov&aacute; B2B popt&aacute;vka</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a2b4a;padding:24px 40px;">
              <h1 style="margin:0;color:#fff;font-size:20px;">Nov&aacute; B2B popt&aacute;vka</h1>
              <p style="margin:4px 0 0;color:#00c389;font-size:13px;">BrightSign Shop</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;width:140px;">Firma</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;font-weight:bold;">${inquiry.company_name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">I&#268;O</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${inquiry.registration_number || "—"}</td>
                </tr>
                ${vatRow}
                ${viesInfoRow}
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">Kontakt</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${inquiry.contact_name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">E-mail</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;"><a href="mailto:${inquiry.email}" style="color:#00c389;">${inquiry.email}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">Telefon</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${inquiry.phone || "—"}</td>
                </tr>
                ${messageRow}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f5f5;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                Automatick&aacute; notifikace z brightsign.cz
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
