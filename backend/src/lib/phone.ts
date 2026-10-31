/** Rwanda phone-number normalization shared by profile, ads and MTN flows.
 * Stored canonical format is E.164 (+2507XXXXXXXX); MTN MSISDN omits the +.
 */
export function normalizeRwandaPhone(input: unknown): string {
  const raw = String(input ?? "").trim();
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("250")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!/^7\d{8}$/.test(digits)) {
    throw new Error("Enter a valid Rwanda mobile number, e.g. +250 7XX XXX XXX");
  }

  return `+250${digits}`;
}

export function toRwandaMsisdn(input: unknown): string {
  return normalizeRwandaPhone(input).slice(1);
}
