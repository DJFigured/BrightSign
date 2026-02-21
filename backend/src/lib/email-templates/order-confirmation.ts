/**
 * Order confirmation email template (Czech)
 * Brand colors: primary #1a2b4a, accent #00c389
 */

interface OrderData {
  display_id: number
  email: string
  total: number
  currency_code: string
  items?: Array<{ title: string; quantity: number; unit_price: number }>
}

export function orderConfirmationTemplate(order: OrderData): string {
  const total = `${(order.total / 100).toFixed(2)} ${order.currency_code.toUpperCase()}`
  const itemsHtml = order.items
    ? order.items
        .map(
          (item) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #eee;">${item.title}</td>
        <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:center;">${item.quantity}x</td>
        <td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">
          ${((item.unit_price * item.quantity) / 100).toFixed(2)} ${order.currency_code.toUpperCase()}
        </td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="3" style="padding:8px 0; color:#888;">Položky objednávky</td></tr>`

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrzení objednávky</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a2b4a;padding:32px 40px;">
              <h1 style="margin:0;color:#fff;font-size:24px;">BrightSign Shop</h1>
              <p style="margin:8px 0 0;color:#00c389;font-size:14px;">brightsign-shop.cz</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1a2b4a;">Vaše objednávka byla přijata</h2>
              <p style="margin:0 0 24px;color:#555;">
                Děkujeme za objednávku č. <strong>#${order.display_id}</strong>.<br>
                Zpracujeme ji co nejdříve a budeme vás informovat o stavu.
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1a2b4a;color:#1a2b4a;font-size:14px;">Produkt</th>
                    <th style="text-align:center;padding:8px 0;border-bottom:2px solid #1a2b4a;color:#1a2b4a;font-size:14px;">Ks</th>
                    <th style="text-align:right;padding:8px 0;border-bottom:2px solid #1a2b4a;color:#1a2b4a;font-size:14px;">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:12px 0 0;font-weight:bold;color:#1a2b4a;">Celkem</td>
                    <td style="padding:12px 0 0;text-align:right;font-weight:bold;color:#1a2b4a;font-size:18px;">${total}</td>
                  </tr>
                </tfoot>
              </table>

              <p style="margin:0;color:#555;font-size:14px;">
                Máte otázky? Odpovíme na <a href="mailto:obchod@brightsign.cz" style="color:#00c389;">obchod@brightsign.cz</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                Make more s.r.o. | IČO: 27082440 | obchod@brightsign.cz
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
