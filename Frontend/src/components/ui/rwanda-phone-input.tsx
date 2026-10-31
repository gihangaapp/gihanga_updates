import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatRwandaPhoneInput, RWANDA_PHONE_PREFIX } from "@/lib/rwanda-phone";

type RwandaPhoneInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
};

function subscriberDigitsBeforeCursor(raw: string, cursor: number): number {
  let digits = raw.slice(0, cursor).replace(/\D/g, "");
  if (digits.startsWith("2507")) digits = digits.slice(4);
  else if (digits.startsWith("250")) {
    digits = digits.slice(3);
    if (digits.startsWith("7")) digits = digits.slice(1);
  } else if (digits.startsWith("07")) digits = digits.slice(2);
  else if (digits.startsWith("7")) digits = digits.slice(1);
  return digits.length;
}

function caretForSubscriberDigits(formatted: string, count: number): number {
  if (count <= 0) return RWANDA_PHONE_PREFIX.length;
  let seen = 0;
  for (let index = RWANDA_PHONE_PREFIX.length; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index]!)) seen += 1;
    if (seen >= count) return index + 1;
  }
  return formatted.length;
}

export function RwandaPhoneInput({ value, onValueChange, ...props }: RwandaPhoneInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pendingCaret = React.useRef<number | null>(null);
  const formattedValue = formatRwandaPhoneInput(value);

  // Seed empty fields with the fixed Rwanda mobile prefix. Validation still
  // requires all eight remaining subscriber digits before submission.
  React.useEffect(() => {
    if (value !== formattedValue) onValueChange(formattedValue);
  }, [value, formattedValue, onValueChange]);

  React.useEffect(() => {
    const input = inputRef.current;
    const count = pendingCaret.current;
    if (!input || count === null) return;
    const caret = caretForSubscriberDigits(formattedValue, count);
    input.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  }, [formattedValue]);

  function updateFromRaw(raw: string, cursor: number) {
    pendingCaret.current = subscriberDigitsBeforeCursor(raw, cursor);
    onValueChange(formatRwandaPhoneInput(raw));
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={formattedValue}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        const currentCaret = event.currentTarget.selectionStart ?? raw.length;
        updateFromRaw(raw, currentCaret);
      }}
      onKeyDown={(event) => {
        const input = event.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? start;
        const prefixLength = RWANDA_PHONE_PREFIX.length;
        const deleting = event.key === "Backspace" || event.key === "Delete";
        if (!deleting) return;

        // Never let keyboard deletion remove any part of the +250 7 prefix.
        if (start < prefixLength || (event.key === "Backspace" && start === prefixLength && end === start)) {
          event.preventDefault();
          if (end > prefixLength) {
            const nextRaw = input.value.slice(0, prefixLength) + input.value.slice(end);
            updateFromRaw(nextRaw, prefixLength);
          } else {
            input.setSelectionRange(prefixLength, prefixLength);
          }
        }
      }}
      onClick={(event) => {
        const input = event.currentTarget;
        if ((input.selectionStart ?? 0) < RWANDA_PHONE_PREFIX.length) {
          input.setSelectionRange(RWANDA_PHONE_PREFIX.length, RWANDA_PHONE_PREFIX.length);
        }
      }}
      onFocus={(event) => {
        const input = event.currentTarget;
        if (!input.value) onValueChange(RWANDA_PHONE_PREFIX);
        requestAnimationFrame(() => {
          if (input.selectionStart !== null && input.selectionStart < RWANDA_PHONE_PREFIX.length) {
            input.setSelectionRange(RWANDA_PHONE_PREFIX.length, RWANDA_PHONE_PREFIX.length);
          }
        });
      }}
    />
  );
}
