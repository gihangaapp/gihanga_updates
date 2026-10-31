import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatRwandaPhoneInput } from "@/lib/rwanda-phone";

type RwandaPhoneInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
};

function subscriberDigitsBeforeCursor(raw: string, cursor: number): number {
  let digits = raw.slice(0, cursor).replace(/\D/g, "");
  if (digits.startsWith("250")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length;
}

export function RwandaPhoneInput({ value, onValueChange, ...props }: RwandaPhoneInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pendingCaret = React.useRef<number | null>(null);

  React.useEffect(() => {
    const input = inputRef.current;
    const subscriberDigits = pendingCaret.current;
    if (!input || subscriberDigits === null) return;

    const formatted = formatRwandaPhoneInput(value);
    const prefixLength = formatted.startsWith("+250 ") ? 5 : 0;
    let digitsSeen = 0;
    let caret = prefixLength || formatted.length;

    for (let index = prefixLength; index < formatted.length; index += 1) {
      if (/\d/.test(formatted[index]!)) digitsSeen += 1;
      if (digitsSeen >= subscriberDigits) {
        caret = index + 1;
        break;
      }
    }

    input.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  }, [value]);

  return (
    <Input
      {...props}
      ref={inputRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={formatRwandaPhoneInput(value)}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        const currentCaret = event.currentTarget.selectionStart ?? raw.length;
        pendingCaret.current = subscriberDigitsBeforeCursor(raw, currentCaret);
        onValueChange(formatRwandaPhoneInput(raw));
      }}
    />
  );
}
