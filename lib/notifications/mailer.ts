import nodemailer from 'nodemailer';

function getTransport(){
  const host = process.env.SMTP_HOST || 'mail.olvinternacional.com.br';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || 'olvsistemas@olvinternacional.com.br';
  const pass = process.env.SMTP_PASS;
  if (!pass) throw new Error('SMTP_PASS não configurado');
  // Porta 587 -> secure=false (STARTTLS)
  return nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

export async function sendEmail({to, subject, html}:{to:string|string[],subject:string,html:string}) {
  const from = process.env.SMTP_FROM || 'OLV Alerts <olvsistemas@olvinternacional.com.br>';
  const transporter = getTransport();
  const info = await transporter.sendMail({ from, to, subject, html });
  return { messageId: info.messageId };
}
