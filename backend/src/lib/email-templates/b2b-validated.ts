/**
 * B2B VAT validated email — sent when VIES retry succeeds
 */

export function b2bValidatedTemplate(customer: {
  email: string
  first_name: string
  company_name?: string
}): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DIČ ověřeno — BrightSign Shop</title>
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
              <p style="margin:0 0 8px;color:#555;">Dobrý den, ${customer.first_name},</p>
              <h2 style="margin:0 0 16px;color:#1a2b4a;">Vaše DIČ bylo úspěšně ověřeno</h2>

              <div style="text-align:center;margin:24px 0;">
                <div style="display:inline-block;background:#00c389;color:#fff;width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;text-align:center;">✓</div>
                <p style="margin:12px 0 0;color:#00c389;font-size:18px;font-weight:bold;">B2B účet aktivní</p>
              </div>

              <p style="color:#555;line-height:1.6;margin-bottom:24px;">
                ${customer.company_name ? `Firma <strong>${customer.company_name}</strong> má` : "Váš účet má"} nyní aktivní
                <strong style="color:#00c389;">10% B2B slevu</strong> na všechny produkty.
                Sleva je automaticky aplikována při každém přihlášení.
              </p>

              <p style="color:#555;font-size:14px;margin-bottom:24px;">
                Potřebujete větší objem? Kontaktujte nás pro individuální nabídku s vyššími slevami (15–20%).
              </p>

              <a href="https://brightsign-shop.cz/katalog" style="display:inline-block;background:#00c389;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
                Nakupovat se slevou →
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
