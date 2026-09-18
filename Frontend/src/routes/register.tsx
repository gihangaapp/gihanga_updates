import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Cake,
  Camera,
  Check,
  Image as ImageIcon,
  Loader2,
  Mail,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  User2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  AuthField,
  PasswordField,
  PasswordStrength,
  StepProgress,
} from "@/components/auth/AuthFields";
import { AuthDivider, SocialButtons } from "@/components/auth/SocialButtons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GAvatar, VerifiedBadge } from "@/components/common/GAvatar";
import { isEmail, passwordScore, interestTopics } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { api, uploadFile, mediaUrl, PublicUser } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Gihanga Updates" },
      {
        name: "description",
        content:
          "Sign up for Gihanga Updates: your details, handle, profile picture, and follow top creators across Rwanda.",
      },
      { property: "og:title", content: "Create your account — Gihanga Updates" },
      {
        property: "og:description",
        content: "Join Gihanga Updates and start sharing stories, reels and updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const hues = [205, 235, 186, 250, 168, 196, 145, 220];
const TOTAL = 4;
const MIN_CREATORS_TO_FOLLOW = 5;

function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signInConsumer } = useAuth();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);

  // Step 1: Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Handle & DOB
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");

  // Step 3: Profile Setup (Avatar Color or Photo, Bio, Account Type)
  const [hue, setHue] = useState(205);
  const [avatarMode, setAvatarMode] = useState<"color" | "image">("color");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [bio, setBio] = useState("");
  const [isCreator, setIsCreator] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Interests & Follow Creators
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [topCreators, setTopCreators] = useState<PublicUser[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  type FieldErrors = {
    name?: string;
    email?: string;
    password?: string;
    username?: string;
    dob?: string;
    step4?: string;
  };
  const [errors, setErrors] = useState<FieldErrors>({});

  const [availability, setAvailability] = useState<
    "idle" | "checking" | "invalid" | "taken" | "free" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Live username availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setAvailability("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
      setAvailability("invalid");
      return;
    }
    setAvailability("checking");
    const t = window.setTimeout(() => {
      api
        .get<{ username: string; status: "invalid" | "taken" | "free" }>(
          `/auth/check-username?username=${encodeURIComponent(clean)}`,
        )
        .then((data) => setAvailability(data.status))
        .catch(() => setAvailability("error"));
    }, 500);
    return () => window.clearTimeout(t);
  }, [username]);

  // Fetch suggested top creators when reaching step 4
  useEffect(() => {
    if (step === 4 && topCreators.length === 0) {
      setLoadingCreators(true);
      const queryInterests = selectedInterests.join(",");
      api
        .get<{ users: PublicUser[] }>(
          `/users/top-creators?interests=${encodeURIComponent(queryInterests)}`,
        )
        .then((res) => {
          const list = res.users || [];
          setTopCreators(list);
          // Pre-select first 5 creators by default if available to guide the user
          if (selectedCreators.length === 0 && list.length > 0) {
            setSelectedCreators(list.slice(0, Math.min(5, list.length)).map((u) => u.username));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCreators(false));
    }
  }, [step, selectedInterests, topCreators.length, selectedCreators.length]);

  // Handle avatar photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB.");
      return;
    }

    setAvatarFile(file);
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setAvatarMode("image");

    // Upload right away to get the permanent URL
    setUploadingAvatar(true);
    try {
      const res = await uploadFile("avatars", file);
      setUploadedAvatarUrl(res.url);
      toast.success("Profile photo uploaded!");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to upload profile photo. You can try again or use a colour.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setUploadedAvatarUrl(null);
    setAvatarMode("color");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleInterest = (topic: string) => {
    setSelectedInterests((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const toggleFollowCreator = (uname: string) => {
    setSelectedCreators((prev) =>
      prev.includes(uname) ? prev.filter((u) => u !== uname) : [...prev, uname],
    );
  };

  async function next() {
    const e: FieldErrors = {};
    if (step === 1) {
      if (name.trim().length < 2) e.name = "Tell us your name.";
      if (!isEmail(email)) e.email = "Enter a valid email address.";
      if (passwordScore(password) < 2) e.password = "Choose a stronger password.";
    }
    if (step === 2) {
      if (availability === "error")
        e.username = "Couldn't check that handle — check your connection and try again.";
      else if (availability !== "free")
        e.username = "Pick an available handle (3–20 letters, numbers or _).";
      if (!dob) e.dob = "Add your date of birth.";
      else if (new Date(dob) > new Date(Date.now() - 13 * 365.25 * 864e5))
        e.dob = "You must be at least 13 years old.";
    }
    if (step === 3) {
      // Step 3 is valid, nothing strictly required beyond options
    }
    if (step === 4) {
      if (selectedCreators.length < MIN_CREATORS_TO_FOLLOW) {
        e.step4 = `Please follow at least ${MIN_CREATORS_TO_FOLLOW} creators or users to personalize your feed (${selectedCreators.length}/${MIN_CREATORS_TO_FOLLOW} selected).`;
      }
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    if (step < TOTAL) {
      setDir(1);
      setStep((s) => s + 1);
      return;
    }

    // Step 4 Complete -> Create the account!
    setFormError(null);
    setBusy(true);

    try {
      let finalAvatarUrl = uploadedAvatarUrl;
      // If user selected an image file but it didn't finish uploading earlier
      if (avatarMode === "image" && avatarFile && !finalAvatarUrl) {
        const res = await uploadFile("avatars", avatarFile);
        finalAvatarUrl = res.url;
      }

      const res = await api.post<any>("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password,
        avatarHue: hue,
        avatarUrl: avatarMode === "image" ? finalAvatarUrl : undefined,
        bio: bio.trim(),
        isCreator,
        interests: selectedInterests,
        followingUsernames: selectedCreators,
        onboarded: true,
      });

      // Synchronize follow cache immediately so feed and buttons are populated
      queryClient.setQueryData(["following-set"], { usernames: selectedCreators });
      queryClient.invalidateQueries({ queryKey: ["following-set"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });

      signInConsumer(res.tokens, res.user);
      setBusy(false);
      toast.success("Welcome to Gihanga Updates!", {
        description: `Account created. Following ${selectedCreators.length} creators.`,
      });
      navigate({ to: "/" });
    } catch (err: any) {
      setBusy(false);
      const message = err?.message || "Registration failed. Please try again.";
      setFormError(message);
      toast.error(message);
      if (/username/i.test(message)) {
        setStep(2);
      } else if (/email/i.test(message)) {
        setStep(1);
      }
    }
  }

  function back() {
    setDir(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  const initials =
    name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "G";

  return (
    <AuthLayout
      title={
        step === 4
          ? "What are you into?"
          : step === 3
            ? "Build your profile"
            : "Create your account"
      }
      subtitle={
        step === 4
          ? `Pick topics and follow at least ${MIN_CREATORS_TO_FOLLOW} creators to shape your feed.`
          : step === 3
            ? "Choose your account type, avatar and write a short bio."
            : "Four short steps and your personalized feed is ready."
      }
      back={{ to: "/welcome", label: "Back to welcome" }}
    >
      <StepProgress step={step} total={TOTAL} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -34 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* STEP 1: Name, Email, Password */}
            {step === 1 && (
              <>
                <AuthField
                  label="Full name"
                  icon={User2}
                  placeholder="Aline Mugisha"
                  autoComplete="name"
                  value={name}
                  error={errors.name}
                  onChange={(e) => setName(e.target.value)}
                />
                <AuthField
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  error={errors.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="space-y-2">
                  <PasswordField
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordStrength value={password} />
                </div>
              </>
            )}

            {/* STEP 2: Username & DOB */}
            {step === 2 && (
              <>
                <div>
                  <AuthField
                    label="Username"
                    icon={AtSign}
                    placeholder="yourhandle"
                    autoCapitalize="none"
                    value={username}
                    error={errors.username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    hint={
                      availability === "checking" ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="size-3 animate-spin" /> Checking availability…
                        </span>
                      ) : availability === "free" ? (
                        <span className="flex items-center gap-1.5 text-success">
                          <Check className="size-3" /> @{username} is available
                        </span>
                      ) : availability === "taken" ? (
                        <span className="flex items-center gap-1.5 text-danger">
                          <X className="size-3" /> @{username} is already taken
                        </span>
                      ) : availability === "invalid" ? (
                        "3–20 characters: letters, numbers or underscores."
                      ) : availability === "error" ? (
                        <span className="flex items-center gap-1.5 text-danger">
                          <X className="size-3" /> Couldn't check availability — retype to try
                          again.
                        </span>
                      ) : (
                        "This is how people will find and mention you."
                      )
                    }
                  />
                </div>
                <AuthField
                  label="Date of birth"
                  icon={Cake}
                  type="date"
                  value={dob}
                  error={errors.dob}
                  onChange={(e) => setDob(e.target.value)}
                  hint="We never show this on your profile."
                />
              </>
            )}

            {/* STEP 3: Profile Setup (Avatar Upload or Color, Bio, Creator Toggle) */}
            {step === 3 && (
              <>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Account Type
                  </p>
                  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsCreator(false)}
                      className={cn(
                        "press rounded-2xl border p-3.5 text-left transition-all",
                        !isCreator
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-soft"
                          : "border-border bg-surface text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <User2 className="size-5 mb-1.5" />
                      <p className="text-sm font-bold text-foreground">Regular User</p>
                      <p className="text-[11px] font-normal text-muted-foreground leading-snug mt-0.5">
                        Watch reels, follow creators, comment, and save posts.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreator(true)}
                      className={cn(
                        "press rounded-2xl border p-3.5 text-left transition-all",
                        isCreator
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-soft"
                          : "border-border bg-surface text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Sparkles className="size-5 mb-1.5" />
                      <p className="text-sm font-bold text-foreground">Creator</p>
                      <p className="text-[11px] font-normal text-muted-foreground leading-snug mt-0.5">
                        Studio analytics, Go Live, Kingdom Points & cash payouts.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Profile Avatar Selection: Color vs Photo Upload */}
                <div className="space-y-3 rounded-2xl border border-border/80 bg-surface/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      Profile Picture
                    </p>
                    <div className="flex shrink-0 items-center rounded-xl bg-muted p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setAvatarMode("color")}
                        className={cn(
                          "rounded-lg px-2.5 py-1 transition-all",
                          avatarMode === "color"
                            ? "bg-card text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Colour
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMode("image");
                          if (!avatarPreview && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className={cn(
                          "rounded-lg px-2.5 py-1 transition-all",
                          avatarMode === "image"
                            ? "bg-card text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  {/* Avatar Live Preview */}
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      {avatarMode === "image" && avatarPreview ? (
                        <div className="relative size-16 overflow-hidden rounded-full border-2 border-primary shadow-soft">
                          <img
                            src={avatarPreview}
                            alt="Profile preview"
                            className="size-full object-cover"
                          />
                          {uploadingAvatar && (
                            <div className="absolute inset-0 grid place-items-center bg-black/50 text-white">
                              <Loader2 className="size-5 animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className="grid size-16 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-primary-foreground shadow-soft"
                          style={{
                            backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${hue}), oklch(0.74 0.1 ${hue + 24}))`,
                          }}
                        >
                          {initials}
                        </span>
                      )}

                      <button
                        type="button"
                        aria-label="Upload photo"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                      >
                        <Camera className="size-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold text-sm text-foreground">
                        {name || "Your name"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{username || "yourhandle"} ·{" "}
                        {isCreator ? "Creator Account" : "Regular User"}
                      </p>

                      {avatarMode === "image" && avatarPreview && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Change photo
                          </button>
                          <span className="text-muted-foreground text-xs">·</span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-xs font-semibold text-danger hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />

                  {/* Photo Upload Dropzone / Button when in image mode without file */}
                  {avatarMode === "image" && !avatarPreview && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="press flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary-soft/40 p-4 text-center cursor-pointer hover:bg-primary-soft/70 transition-colors"
                    >
                      <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                        <UploadCloud className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Click to upload your profile photo
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          PNG, JPG or WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Color Palette Selector when in color mode */}
                  {avatarMode === "color" && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Select an avatar color tone:
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {hues.map((h) => (
                          <button
                            key={h}
                            type="button"
                            aria-label={`Avatar colour ${h}`}
                            onClick={() => setHue(h)}
                            className={cn(
                              "press grid size-8 place-items-center rounded-full",
                              hue === h && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                            )}
                            style={{
                              backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${h}), oklch(0.74 0.1 ${h + 24}))`,
                            }}
                          >
                            {hue === h && <Check className="size-3.5 text-primary-foreground" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Short Bio */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="bio"
                    className="block text-xs font-bold tracking-wide text-muted-foreground uppercase"
                  >
                    Short bio
                  </label>
                  <textarea
                    id="bio"
                    rows={2}
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Storyteller from Kigali. Building things that matter."
                    className="w-full resize-none rounded-2xl border border-border bg-surface/80 p-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:shadow-glow"
                  />
                  <p className="text-right text-xs text-muted-foreground">{bio.length}/160</p>
                </div>
              </>
            )}

            {/* STEP 4: "What are you into?" & Follow Top Creators */}
            {step === 4 && (
              <div className="space-y-5">
                {/* 1. Topics Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      What are you into?
                    </p>
                    <span className="text-[11px] font-semibold text-primary">
                      {selectedInterests.length} topics selected
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-2xl border border-border/80 bg-surface/60 p-3 space-y-3 no-scrollbar">
                    {interestTopics.map((group) => (
                      <div key={group.category}>
                        <p className="mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {group.category}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.topics.map((topic) => {
                            const on = selectedInterests.includes(topic);
                            return (
                              <button
                                key={topic}
                                type="button"
                                aria-pressed={on}
                                onClick={() => toggleInterest(topic)}
                                className={cn(
                                  "press inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all",
                                  on
                                    ? "gradient-brand border-transparent text-primary-foreground shadow-xs font-bold"
                                    : "border-border bg-card text-foreground/80 hover:bg-muted",
                                )}
                              >
                                {on && <Check className="size-3" />}
                                {topic}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Follow Top Creators & Users */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary" />
                        Follow Top Creators & Users
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Follow at least {MIN_CREATORS_TO_FOLLOW} creators to see their stories &
                        posts
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-bold",
                        selectedCreators.length >= MIN_CREATORS_TO_FOLLOW
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning",
                      )}
                    >
                      {selectedCreators.length} / {MIN_CREATORS_TO_FOLLOW}
                    </span>
                  </div>

                  {errors.step4 && (
                    <p className="rounded-lg bg-danger/10 p-2 text-xs font-medium text-danger">
                      {errors.step4}
                    </p>
                  )}

                  {/* Creators List */}
                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-border/80 bg-surface/60 p-2 space-y-2 no-scrollbar">
                    {loadingCreators ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <p className="text-xs">Finding the best creators for you…</p>
                      </div>
                    ) : topCreators.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Loading creators…
                      </p>
                    ) : (
                      topCreators.map((creator) => {
                        const isFollowing = selectedCreators.includes(creator.username);
                        return (
                          <div
                            key={creator._id || creator.username}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors",
                              isFollowing
                                ? "bg-primary-soft/40 border border-primary/20"
                                : "bg-card/70 hover:bg-muted/60",
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <GAvatar user={creator} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className="truncate font-bold text-xs text-foreground">
                                    {creator.name}
                                  </p>
                                  {creator.verified && <VerifiedBadge className="size-3.5" />}
                                  {creator.isCreator && (
                                    <span className="shrink-0 rounded bg-primary/10 px-1 py-px text-[9px] font-bold text-primary">
                                      Creator
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  @{creator.username} · {formatCount(creator.followersCount || 0)}{" "}
                                  followers
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              size="sm"
                              variant={isFollowing ? "brand" : "outline"}
                              onClick={() => toggleFollowCreator(creator.username)}
                              className="h-11 min-h-11 max-[360px]:px-2.5 shrink-0 px-3 text-xs font-bold gap-1 rounded-xl"
                              aria-label={
                                isFollowing
                                  ? `Unfollow ${creator.username}`
                                  : `Follow ${creator.username}`
                              }
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="size-4 shrink-0" />
                                  <span className="max-[360px]:hidden">Following</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="size-4 shrink-0" />
                                  <span className="max-[360px]:hidden">Follow</span>
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {formError && (
        <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger">
          {formError}
        </p>
      )}

      {/* Navigation Buttons — B6: stacks (primary first) below 360px, full
          width when stacked, min-w-0 so nothing overflows. */}
      <div className="mt-6 flex flex-col-reverse gap-2.5 max-[360px]:flex-col-reverse min-[361px]:flex-row">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={back}
            className="min-w-0 flex-1 max-[360px]:w-full"
            disabled={busy}
          >
            <ArrowLeft className="shrink-0" />
            <span className="truncate">Back</span>
          </Button>
        )}
        <Button
          variant="brand"
          size="lg"
          onClick={next}
          className="min-w-0 flex-[2] max-[360px]:w-full"
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="shrink-0 animate-spin" />
          ) : step === TOTAL ? (
            <Sparkles className="shrink-0 size-4" />
          ) : null}
          <span className="min-w-0">
            {step === TOTAL ? (busy ? "Creating account…" : "Create account") : "Continue"}
          </span>
          {!busy && step < TOTAL && <ArrowRight className="shrink-0" />}
        </Button>
      </div>

      {step === 1 && (
        <>
          <AuthDivider />
          <SocialButtons mode="up" />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
