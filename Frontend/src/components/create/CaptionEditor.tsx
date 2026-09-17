import { useState, useRef } from "react";
import { Hash, AtSign, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Textarea } from "@/components/ui/textarea";
import { GAvatar } from "@/components/common/GAvatar";
import { useFollowing } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}

export function CaptionEditor({
  value,
  onChange,
  maxLength = 2200,
  placeholder = "Write a caption… Use #hashtags and @mentions",
  className,
}: CaptionEditorProps) {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users that the current user follows
  const { data: followingData } = useFollowing(user?.username ?? "");
  const followedUsers = followingData?.users ?? [];

  // Filter followed users based on typed letters after '@'
  const suggestedFollowedUsers = mentionQuery !== null
    ? followedUsers.filter((u) => {
        const query = mentionQuery.toLowerCase();
        return (
          u.username.toLowerCase().includes(query) ||
          u.name.toLowerCase().includes(query)
        );
      })
    : [];

  // Detect active @mention as user types
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (username: string) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${username} `);

    onChange(newTextBefore + textAfterCursor);
    setMentionQuery(null);
    textareaRef.current.focus();
  };

  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);

    onChange(textBeforeCursor + emoji + textAfterCursor);
    textareaRef.current.focus();
  };

  const insertHashtagSymbol = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);

    const prefix = textBefore.length > 0 && !textBefore.endsWith(" ") ? " #" : "#";
    onChange(textBefore + prefix + textAfter);
    textareaRef.current.focus();
  };

  // Extract hashtags for preview tag chips
  const tags = Array.from(value.matchAll(/#(\w+)/g)).map((m) => m[1]);

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          maxLength={maxLength}
          placeholder={placeholder}
          className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
        />

        {/* Mention Suggestions Popup (Only People You Follow based on letters typed) */}
        {mentionQuery !== null && suggestedFollowedUsers.length > 0 && (
          <div className="absolute left-0 bottom-full z-50 mb-2 max-h-48 w-64 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-float no-scrollbar">
            <p className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase">People you follow</p>
            {suggestedFollowedUsers.slice(0, 6).map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => insertMention(u.username)}
                className="press flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                <GAvatar user={u} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{u.name}</p>
                  <p className="truncate text-muted-foreground">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Tag Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t, idx) => (
            <span
              key={`${t}_${idx}`}
              className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Quick Toolbar & Character Counter */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={insertHashtagSymbol}
            className="press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Hash className="size-3.5 text-primary" />
            Hashtag
          </button>
          <button
            type="button"
            onClick={() => {
              if (!textareaRef.current) return;
              const pos = textareaRef.current.selectionStart;
              onChange(value.slice(0, pos) + "@" + value.slice(pos));
              setMentionQuery("");
              textareaRef.current.focus();
            }}
            className="press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <AtSign className="size-3.5 text-accent" />
            Mention
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Smile className="size-3.5 text-warning" />
            Emoji
          </button>
        </div>

        <span
          className={cn(
            "text-xs font-medium",
            value.length > maxLength * 0.9 ? "text-danger" : "text-muted-foreground"
          )}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Interactive Emoji Picker (emoji-picker-react) */}
      {showEmojiPicker && (
        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-float mt-2 bg-popover z-40">
          <EmojiPicker
            theme={Theme.DARK}
            width="100%"
            height={300}
            lazyLoadEmojis
            searchPlaceHolder="Search emoji..."
            onEmojiClick={(emojiData: EmojiClickData) => {
              insertEmoji(emojiData.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
