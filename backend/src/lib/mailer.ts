import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM || "Gihanga Updates <no-reply@gihanga.rw>";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = host && port && user && pass
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  : null;

export async function sendEmail(message: EmailMessage) {
  if (!transporter) {
    console.warn("[Mailer] SMTP not configured. Skipping email send.", message);
    return;
  }

  await transporter.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
