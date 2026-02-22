/**
 * B2B inquiry confirmation email for customer
 */

export function b2bInquiryConfirmationTemplate(inquiry: {
  contact_name: string
  company_name: string
  email: string
}): string {
  const frontendUrl = process.env.FRONTEND_URL || "https://brightsign-shop.cz"

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B popt&aacute;vka p&#345;ijata</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a2b4a;padding:32px 40px;">
              <h1 style="margin:0;color:#fff;font-size:24px;">BrightSign Shop</h1>
              <p style="margin:8px 0 0;color:#00c389;font-size:14px;">B2B program</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#555;">Dobr&yacute; den, ${inquiry.contact_name},</p>
              <h2 style="margin:0 0 20px;color:#1a2b4a;">D&#283;kujeme za v&aacute;&scaron; z&aacute;jem o B2B spolupr&aacute;ci</h2>

              <p style="margin:0 0 16px;color:#555;line-height:1.6;">
                P&#345;ijali jsme va&scaron;i popt&aacute;vku za spole&#269;nost <strong>${inquiry.company_name}</strong>.
                N&aacute;&scaron; t&yacute;m ji zpracuje a ozveme se v&aacute;m <strong>do 24 hodin</strong> na adresu
                <a href="mailto:${inquiry.email}" style="color:#00c389;">${inquiry.email}</a>.
              </p>

              <div style="background:#f8f9fa;border-left:4px solid #00c389;padding:16px;border-radius:0 4px 4px 0;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;color:#1a2b4a;font-size:15px;">Co v&aacute;s &#269;ek&aacute;?</h3>
                <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;">
                  <li style="margin-bottom:4px;">Ov&#283;&#345;en&iacute; DI&#268; (pokud bylo uvedeno)</li>
                  <li style="margin-bottom:4px;">Z&#345;&iacute;zen&iacute; B2B &uacute;&#269;tu se slevou 10&ndash;20 %</li>
                  <li>P&#345;&iacute;stup k fakturaci na firmu</li>
                </ul>
              </div>

              <a href="${frontendUrl}/katalog" style="display:inline-block;background:#00c389;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
                Prohl&eacute;dnout katalog &#8594;
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f5f5;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                Make more s.r.o. | obchod@brightsign.cz
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
