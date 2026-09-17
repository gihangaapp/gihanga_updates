import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const POPULAR_LOCATIONS = [
  "Kigali, Rwanda",
  "Musanze, Rwanda",
  "Rubavu, Rwanda",
  "Huye, Rwanda",
  "Nyamata, Rwanda",
  "Gisenyi, Rwanda",
  "Online / Global",
];

export function LocationInput({ value, onChange, className }: LocationInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 size-4 text-success" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add location (e.g. Kigali, Rwanda)"
          className="h-10 pl-9 pr-8 text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Popular locations dropdown suggestions */}
      {showSuggestions && !value && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-float no-scrollbar">
          <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">Popular Places</p>
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                onChange(loc);
                setShowSuggestions(false);
              }}
              className="press flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-muted"
            >
              <MapPin className="size-3 text-success" />
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
