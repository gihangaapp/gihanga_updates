import { useState, useEffect } from "react";
import { Smile, AtSign, MapPin, Hash, HelpCircle, BarChart2, Clock, Sparkles } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { api, type UserProfile } from "@/lib/api-client";
import { GAvatar } from "@/components/common/GAvatar";
import { cn } from "@/lib/utils";

export interface StorySticker {
  id: string;
  type: "emoji" | "mention" | "location" | "hashtag" | "question" | "poll" | "countdown";
  content: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  extra?: any;
}

interface StoryStickerPickerProps {
  onSelectSticker: (sticker: StorySticker) => void;
  onClose: () => void;
}

const STICKER_TYPES: { id: StorySticker["type"]; label: string; icon: typeof Smile; color: string }[] = [
  { id: "emoji", label: "Emoji", icon: Smile, color: "text-amber-400" },
  { id: "mention", label: "Mention", icon: AtSign, color: "text-indigo-400" },
  { id: "location", label: "Location", icon: MapPin, color: "text-emerald-400" },
  { id: "hashtag", label: "Hashtag", icon: Hash, color: "text-sky-400" },
  { id: "question", label: "Question", icon: HelpCircle, color: "text-blue-400" },
  { id: "poll", label: "Poll", icon: BarChart2, color: "text-purple-400" },
  { id: "countdown", label: "Timer", icon: Clock, color: "text-rose-400" },
];

export function StoryStickerPicker({ onSelectSticker, onClose }: StoryStickerPickerProps) {
  const [activeType, setActiveType] = useState<StorySticker["type"]>("emoji");
  const [inputText, setInputText] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([]);

  // Live user search for Mentions
  useEffect(() => {
    if (activeType !== "mention" || !inputText.trim()) {
      setUserSearchResults([]);
      return;
    }

    const query = inputText.replace(/^@/, "").trim();
    if (!query) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ users: UserProfile[] }>(`/search?q=${encodeURIComponent(query)}`);
        if (isMounted) setUserSearchResults(res?.users ?? []);
      } catch {
        if (isMounted) setUserSearchResults([]);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [inputText, activeType]);

  const handleSelectMentionUser = (u: UserProfile) => {
    onSelectSticker({
      id: `stk_mention_${Date.now()}`,
      type: "mention",
      content: `@${u.username}`,
      x: 50,
      y: 50,
      extra: { userId: u._id, name: u.name },
    });
    onClose();
  };

  const handleCreateCustomSticker = () => {
    if (!inputText.trim()) return;
    let content = inputText.trim();
    if (activeType === "mention" && !content.startsWith("@")) content = `@${content}`;
    if (activeType === "hashtag" && !content.startsWith("#")) content = `#${content}`;

    onSelectSticker({
      id: `stk_${Date.now()}`,
      type: activeType,
      content,
      x: 50,
      y: 50,
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-slate-950 p-5 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-auto text-white select-none">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold flex items-center gap-1.5">
          <Sparkles className="size-4 text-amber-400" /> Add Stickers
        </h3>
        <button type="button" onClick={onClose} className="text-xs text-white/60 hover:text-white">
          Cancel
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {STICKER_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveType(t.id);
                setInputText("");
              }}
              className={cn(
                "press flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all",
                activeType === t.id
                  ? "bg-white text-slate-950 font-extrabold shadow-md"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              <Icon className={cn("size-3.5", activeType === t.id ? "text-slate-950" : t.color)} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sticker Content Stage (Emoji Picker with Smooth Scrolling) */}
      {activeType === "emoji" ? (
        <div className="w-full h-[340px] flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-slate-900">
          <EmojiPicker
            theme={Theme.DARK}
            width="100%"
            height="100%"
            lazyLoadEmojis
            searchPlaceHolder="Search emoji..."
            onEmojiClick={(emojiData: EmojiClickData) => {
              onSelectSticker({
                id: `stk_${Date.now()}_${Math.random()}`,
                type: "emoji",
                content: emojiData.emoji,
                x: 50,
                y: 50,
              });
              onClose();
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 py-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeType === "mention"
                ? "Search @username..."
                : activeType === "location"
                  ? "Enter location (e.g. Kigali, Rwanda)"
                  : activeType === "hashtag"
                    ? "Enter #hashtag"
                    : activeType === "question"
                      ? "Ask me anything..."
                      : activeType === "poll"
                        ? "Ask a question..."
                        : "Countdown event..."
            }
            className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Mentions live search results */}
          {activeType === "mention" && userSearchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-xl bg-white/10 p-2">
              {userSearchResults.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleSelectMentionUser(u)}
                  className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/15 text-left transition-colors"
                >
                  <GAvatar user={u} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold leading-tight">{u.name}</p>
                    <p className="truncate text-[10px] text-white/60">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateCustomSticker}
            disabled={!inputText.trim()}
            className="press rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 shadow-lg disabled:opacity-40 hover:bg-white/90"
          >
            Add Sticker
          </button>
        </div>
      )}
    </div>
  );
}
