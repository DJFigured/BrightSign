/**
 * B2B welcome email template — sent immediately after registration
 */

export function b2bWelcomeTemplate(
  customer: { email: string; first_name: string; company_name?: string },
  vatStatus: "valid" | "invalid" | "pending"
): string {
  const statusMessages = {
    valid: {
      heading: "Váš B2B účet je aktivní",
      body: `DIČ bylo ověřeno. Máte automaticky aktivní <strong style="color:#00c389;">10% B2B slevu</strong> na všechny produkty.`,
      badge: `<span style="display:inline-block;background:#00c389;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">✓ DIČ ověřeno</span>`,
    },
    pending: {
      heading: "B2B registrace přijata — ověřujeme DIČ",
      body: `Ověření DIČ probíhá (VIES je dočasně nedostupný). Zatím máte dočasný B2B přístup. Jakmile ověření proběhne, dostanete potvrzení e-mailem.`,
      badge: `<span style="display:inline-block;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">⏳ Ověřování DIČ</span>`,
    },
    invalid: {
      heading: "Registrace dokončena — DIČ k ověření",
      body: `DIČ se nepodařilo ověřit automaticky. Kontaktujte nás na <a href="mailto:obchod@brightsign.cz" style="color:#00c389;">obchod@brightsign.cz</a> pro ruční schválení B2B účtu.`,
      badge: `<span style="display:inline-block;background:#ef4444;color:#fff;padding:4px 12px;border-radius:4px;font-size:13px;font-weight:bold;">⚠ DIČ k ověření</span>`,
    },
  }

  const status = statusMessages[vatStatus]

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B registrace — BrightSign Shop</title>
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
              <h2 style="margin:0 0 16px;color:#1a2b4a;">${status.heading}</h2>
              ${status.badge}
              <p style="margin:20px 0;color:#555;line-height:1.6;">${status.body}</p>

              <div style="background:#f8f9fa;border-left:4px solid #00c389;padding:16px;border-radius:0 4px 4px 0;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;color:#1a2b4a;font-size:15px;">Vaše B2B výhody</h3>
                <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;">
                  <li style="margin-bottom:4px;">10–20% sleva na všechny produkty</li>
                  <li style="margin-bottom:4px;">Platba na fakturu (po schválení)</li>
                  <li style="margin-bottom:4px;">Reverse charge pro EU zákazníky</li>
                  <li>Prioritní podpora</li>
                </ul>
              </div>

              <a href="https://brightsign-shop.cz/katalog" style="display:inline-block;background:#00c389;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
                Přejít do katalogu →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f5f5;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                Make more s.r.o. | obchod@brightsign.cz | +420 xxx xxx xxx
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
