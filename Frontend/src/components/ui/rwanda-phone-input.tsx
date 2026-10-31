import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatRwandaPhoneInput } from "@/lib/rwanda-phone";

type RwandaPhoneInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function RwandaPhoneInput({ value, onValueChange, ...props }: RwandaPhoneInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pendingCaret = React.useRef<number | null>(null);

  React.useEffect(() => {
    const input = inputRef.current;
    const digitsBeforeCaret = pendingCaret.current;
    if (!input || digitsBeforeCaret === null) return;

    let digitsSeen = 0;
    let caret = formatRwandaPhoneInput(value).length;
    const formatted = formatRwandaPhoneInput(value);
    for (let index = 0; index < formatted.length; index += 1) {
      if (/\d/.test(formatted[index]!)) digitsSeen += 1;
      if (digitsSeen >= digitsBeforeCaret) {
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
        pendingCaret.current = raw.slice(0, currentCaret).replace(/\D/g, "").length;
        onValueChange(formatRwandaPhoneInput(raw));
      }}
    />
  );
}
