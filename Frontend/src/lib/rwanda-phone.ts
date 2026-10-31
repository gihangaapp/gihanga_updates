/** Rwanda phone helpers. Display: +250 7XX XXX XXX; submit/store: +2507XXXXXXXX. */
export function normalizeRwandaPhone(input: string): string {
  let digits = String(input ?? "").replace(/\D/g, "");
  if (digits.startsWith("250")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^7\d{8}$/.test(digits)) {
    throw new Error("Enter a valid Rwanda mobile number in the format +250 7XX XXX XXX");
  }
  return `+250${digits}`;
}

export function formatRwandaPhoneInput(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");

  // Preserve a country prefix while the user is typing it character by character.
  if (raw.startsWith("+") && (digits === "2" || digits === "25")) return `+${digits}`;
  if (!digits) return raw === "+" ? "+" : "";

  if (digits.startsWith("250")) digits = digits.slice(3);
  else if (digits.startsWith("0")) {
    if (digits === "0") return "0";
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 9);
  if (!digits) return "+250";
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
  return `+250 ${groups.join(" ")}`;
}
