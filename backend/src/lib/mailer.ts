import nodemailer from "nodemailer";

// Trim env vars defensively — a stray trailing space/newline in a
// platform's env var editor (very common with copy-pasted Gmail app
// passwords, which contain spaces) is enough to make Gmail's SMTP server
// reject auth outright, which nodemailer then surfaces as a generic
// connection/auth error.
const host = process.env.EMAIL_HOST?.trim();
const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT.trim()) : undefined;
const user = process.env.EMAIL_USER?.trim();
// Gmail app passwords are shown with spaces (e.g. "abcd efgh ijkl mnop")
// for readability but must be used either with or without them — Google
// accepts both, but some SMTP libs/env loaders choke on the embedded
// spaces if the value wasn't quoted correctly. Stripping spaces here makes
// the value robust regardless of how it was pasted into the platform.
const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");
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
    throw new Error("SMTP is not configured (missing EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASS)");
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    console.log(`[Mailer] Email sent to ${message.to} (messageId: ${info.messageId})`);
    return info;
  } catch (err: any) {
    // Surface a clearer message for the most common Gmail SMTP failure
    // modes so logs point straight at the fix instead of a generic error.
    if (err?.code === "EAUTH") {
      console.error(
        "[Mailer] SMTP authentication failed. For Gmail, EMAIL_USER must be a full Gmail address and " +
          "EMAIL_PASS must be a 16-character App Password (not your regular Gmail password) generated " +
          "at https://myaccount.google.com/apppasswords — this requires 2-Step Verification to be enabled.",
        err.response || err.message,
      );
    } else if (err?.code === "ETIMEDOUT" || err?.code === "ESOCKET" || err?.code === "ECONNECTION") {
      console.error(
        "[Mailer] Could not reach SMTP server. Check EMAIL_HOST/EMAIL_PORT and that outbound traffic on " +
          "that port isn't blocked by the hosting provider.",
        err.message,
      );
    } else {
      console.error("[Mailer] Failed to send email:", err);
    }
    throw err;
  }
}

/**
 * Verifies the SMTP connection/credentials without sending an email.
 * Call this once at startup so misconfiguration shows up immediately in
 * the server logs instead of only surfacing when a real user hits
 * register/resend/forgot-password.
 */
export async function verifyMailer() {
  if (!transporter) {
    console.warn(
      "[Mailer] SMTP not configured — EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASS must all be set. " +
        "Verification/reset emails will fail until this is fixed.",
    );
    return false;
  }

  try {
    await transporter.verify();
    console.log(`[Mailer] SMTP connection verified (${host}:${port}, user: ${user}). Ready to send emails.`);
    return true;
  } catch (err: any) {
    if (err?.code === "EAUTH") {
      console.error(
        "[Mailer] SMTP verification failed: authentication rejected. For Gmail, make sure EMAIL_USER is the " +
          "full Gmail address, EMAIL_PASS is a Google App Password (16 chars, no spaces needed), and that " +
          "2-Step Verification is enabled on the account (App Passwords require it).",
        err.response || err.message,
      );
    } else {
      console.error("[Mailer] SMTP verification failed:", err.message || err);
    }
    return false;
  }
}
