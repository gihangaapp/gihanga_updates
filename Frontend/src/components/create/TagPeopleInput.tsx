import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GAvatar } from "@/components/common/GAvatar";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

interface TagPeopleInputProps {
  taggedUsers: string[]; // List of tagged usernames
  onChange: (users: string[]) => void;
  className?: string;
}

export function TagPeopleInput({ taggedUsers, onChange, className }: TagPeopleInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: searchResults } = useSearch(query);

  const addTag = (username: string) => {
    if (!taggedUsers.includes(username)) {
      onChange([...taggedUsers, username]);
    }
    setQuery("");
    setIsOpen(false);
  };

  const removeTag = (username: string) => {
    onChange(taggedUsers.filter((u) => u !== username));
  };

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div className="relative flex items-center">
        <UserPlus className="absolute left-3 size-4 text-primary" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tag people by @username"
          className="h-10 pl-9 text-sm"
        />
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && query.trim().length > 0 && searchResults?.users && searchResults.users.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-float no-scrollbar">
          {searchResults.users.map((user) => {
            const isAlreadyTagged = taggedUsers.includes(user.username);
            return (
              <button
                key={user._id}
                type="button"
                disabled={isAlreadyTagged}
                onClick={() => addTag(user.username)}
                className={cn(
                  "press flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-muted",
                  isAlreadyTagged && "opacity-50"
                )}
              >
                <GAvatar user={user} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{user.name}</p>
                  <p className="truncate text-muted-foreground">@{user.username}</p>
                </div>
                {isAlreadyTagged && <span className="text-[10px] text-muted-foreground">Tagged</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Tagged users chips */}
      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {taggedUsers.map((username) => (
            <span
              key={username}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
            >
              @{username}
              <button
                type="button"
                onClick={() => removeTag(username)}
                className="hover:text-danger"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
