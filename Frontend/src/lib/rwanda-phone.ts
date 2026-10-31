/** Rwanda phone helpers. Display: +250 7XX XXX XXX; submit/store: +2507XXXXXXXX. */
const RWANDA_PREFIX = "+250 7";

function subscriberDigits(input: string): string {
  let digits = String(input ?? "").replace(/\D/g, "");
  if (digits.startsWith("2507")) return digits.slice(4);
  if (digits.startsWith("250")) {
    digits = digits.slice(3);
    if (digits.startsWith("7")) digits = digits.slice(1);
    return digits;
  }
  if (digits.startsWith("07")) return digits.slice(2);
  if (digits.startsWith("7")) return digits.slice(1);
  // When typing after the fixed prefix, the browser may provide only the
  // subscriber portion (for example after select-all and paste).
  return digits.replace(/^0?7?/, "");
}

export function normalizeRwandaPhone(input: string): string {
  const raw = String(input ?? "").trim();
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^7\d{8}$/.test(digits)) {
    throw new Error("Enter a valid Rwanda mobile number in the format +250 7XX XXX XXX");
  }
  return `+250${digits}`;
}

/** Always returns a visible, protected +250 7 prefix, even for an empty value. */
export function formatRwandaPhoneInput(input: string): string {
  const digits = subscriberDigits(input).slice(0, 8);
  if (!digits) return RWANDA_PREFIX;
  const firstGroup = digits.slice(0, 2);
  const middleGroup = digits.slice(2, 5);
  const finalGroup = digits.slice(5, 8);
  return `${RWANDA_PREFIX}${firstGroup}${middleGroup ? ` ${middleGroup}` : ""}${finalGroup ? ` ${finalGroup}` : ""}`;
}

export const RWANDA_PHONE_PREFIX = RWANDA_PREFIX;
