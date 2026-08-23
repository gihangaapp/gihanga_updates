import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Eye, LogOut, Moon, Palette, Shield, Sun, User2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSessionUser } from "@/components/auth/AccountMenu";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth-context";
import { api, uploadFile } from "@/lib/api-client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Manage Your Gihanga Account" },
      {
        name: "description",
        content:
          "Update your profile, appearance, notification and privacy preferences for Gihanga Updates.",
      },
      { property: "og:title", content: "Settings — Manage Your Gihanga Account" },
      {
        property: "og:description",
        content: "Profile, appearance, notification and privacy preferences on Gihanga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Bell;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card mb-4 p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Row({
  id,
  label,
  hint,
  defaultOn,
}: {
  id: string;
  label: string;
  hint: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch
        id={id}
        checked={on}
        onCheckedChange={(v) => {
          setOn(v);
          toast(`${label} ${v ? "on" : "off"}`);
        }}
      />
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useSessionUser();
  const { updateConsumerProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-[680px] py-10 text-center text-sm text-muted-foreground">
          Loading your settings…
        </div>
      </AppShell>
    );
  }
  const me = user;

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api.patch<{ user: Parameters<typeof updateConsumerProfile>[0] }>("/auth/me", {
        name,
        bio,
      });
      updateConsumerProfile(data.user);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Couldn't update your profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePhoto(file: File) {
    setUploadingAvatar(true);
    try {
      await uploadFile("avatars", file);
      // The upload endpoint already saved the URL onto the user document — pull the
      // full fresh profile back down so avatarUrl (and everything else) is in sync.
      const data = await api.get<{ user: Parameters<typeof updateConsumerProfile>[0] }>("/auth/me");
      updateConsumerProfile(data.user);
      toast.success("Profile photo updated");
    } catch (err: any) {
      toast.error(err.message || "Couldn't upload that photo");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[680px]">
        <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">Settings</h1>

        <Section title="Profile" icon={User2}>
          <div className="flex items-center gap-4">
            <GAvatar user={me} size="lg" ring="story" />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) changePhoto(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
              {uploadingAvatar ? "Uploading…" : "Change photo"}
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-name" className="text-sm font-semibold">
              Display name
            </Label>
            <input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl bg-elevated px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-bio" className="text-sm font-semibold">
              Bio
            </Label>
            <textarea
              id="s-bio"
              value={bio}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none rounded-xl bg-elevated p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="brand" className="self-start" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Section>

        <Section title="Appearance" icon={Palette}>
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Theme</p>
              <p className="text-xs text-muted-foreground">Ocean Deep looks great either way.</p>
            </div>
            <div className="glass flex gap-1 rounded-xl border p-1">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  className={`press flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    theme === t ? "bg-primary-soft text-primary" : "text-muted-foreground"
                  }`}
                >
                  {t === "light" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  {t === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
          <Row id="s-motion" label="Reduced motion" hint="Trim animations across the app." />
        </Section>

        <Section title="Notifications" icon={Bell}>
          <Row id="s-likes" label="Likes and comments" hint="Ping me when people react." defaultOn />
          <Row id="s-follows" label="New followers" hint="Know when your audience grows." defaultOn />
          <Row id="s-live" label="Live alerts" hint="Creators you follow going live." />
          <Row id="s-digest" label="Weekly digest" hint="A Monday summary by email." defaultOn />
        </Section>

        <Section title="Privacy" icon={Shield}>
          <Row id="s-private" label="Private account" hint="Only approved followers see posts." />
          <Row id="s-tags" label="Allow tagging" hint="Let others tag you in posts." defaultOn />
          <Row id="s-dm" label="Message requests" hint="Anyone can start a chat with you." defaultOn />
        </Section>

        <Section title="Account" icon={Eye}>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => {
              signOut();
              toast("Signed out");
              navigate({ to: "/welcome" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </Section>
      </div>
    </AppShell>
  );
}
