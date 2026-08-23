import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
// Gmail's SMTP requires the From header's address to match (or be an
// authorized alias of) the authenticated account, or it silently
// rejects/spam-folders the message. If EMAIL_FROM is just a display name
// with no "<email>" part (e.g. `EMAIL_FROM="Gihanga Updates"`), build a
// correct one from EMAIL_USER instead of sending an invalid/mismatched From.
const fromDisplayName = (process.env.EMAIL_FROM || "Gihanga Updates").replace(/\s*<.*>\s*$/, "").trim();
const from = user ? `${fromDisplayName} <${user}>` : process.env.EMAIL_FROM || "Gihanga Updates <no-reply@gihanga.rw>";

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
      // Without these, a slow/unreachable SMTP connection can hang for
      // minutes (Node/nodemailer's own defaults are very long). Fail fast
      // instead so the caller's timeout logic (see sendEmail below) kicks in
      // well before the HTTP request itself times out.
      connectionTimeout: 10_000, // time to establish the TCP connection
      greetingTimeout: 10_000, // time to receive the SMTP greeting
      socketTimeout: 15_000, // time between bytes once connected
      // Reuse a single connection across sends instead of opening a fresh
      // one (and redoing the TLS handshake) every time — this is what was
      // making repeated sends (e.g. resend code) slow on top of any
      // per-request latency.
      pool: true,
      maxConnections: 3,
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
