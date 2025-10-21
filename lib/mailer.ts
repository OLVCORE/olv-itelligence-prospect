import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

export async function sendReport(
  to: string,
  subject: string,
  pdfBase64: string,
  companyName: string
) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject,
    html: `
      <h2>Relatório: ${companyName}</h2>
      <p>Segue em anexo o relatório executivo completo.</p>
      <p>--<br>OLV Intelligent Prospecting System</p>
    `,
    attachments: [
      {
        filename: `relatorio-${companyName.replace(/\s+/g, '-')}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      },
    ],
  })
}

