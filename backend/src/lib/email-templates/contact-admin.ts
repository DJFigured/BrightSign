/**
 * Contact form admin notification email template
 */

export interface ContactData {
  name: string
  email: string
  subject?: string
  message: string
}

export function contactAdminTemplate(data: ContactData): string {
  const subjectRow = data.subject
    ? `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;width:140px;">P&#345;edm&#283;t</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${data.subject}</td>
      </tr>`
    : ""

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nov&aacute; zpr&aacute;va z kontaktn&iacute;ho formul&aacute;&#345;e</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a2b4a;padding:24px 40px;">
              <h1 style="margin:0;color:#fff;font-size:20px;">Nov&aacute; zpr&aacute;va z webu</h1>
              <p style="margin:4px 0 0;color:#00c389;font-size:13px;">BrightSign Shop — kontaktn&iacute; formul&aacute;&#345;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;width:140px;">Jm&eacute;no</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;font-weight:bold;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;">E-mail</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;"><a href="mailto:${data.email}" style="color:#00c389;">${data.email}</a></td>
                </tr>
                ${subjectRow}
                <tr>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#888;font-size:14px;vertical-align:top;">Zpr&aacute;va</td>
                  <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;white-space:pre-wrap;">${data.message}</td>
                </tr>
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
