import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bn as AtSign, Hn as ArrowRight, I as Sparkles, Mt as LoaderCircle, On as Check, Ot as Mail, Pn as Cake, Un as ArrowLeft, _ as UserPlus, a as X, b as UserCheck, g as UserRound, gn as CloudUpload, jn as Camera, p as Users } from "../_libs/lucide-react.mjs";
import { n as api, u as uploadFile } from "./api-client-C-02deeD.mjs";
import { C as VerifiedBadge, p as GAvatar, w as formatCount } from "./router-Dh25U3j0.mjs";
import { a as interestTopics, l as useAuth, o as isEmail, s as passwordScore } from "./auth-context-Duh7Mq6E.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as AuthLayout } from "./AuthLayout-cw0K42Ps.mjs";
import { i as StepProgress, n as PasswordField, r as PasswordStrength, t as AuthField } from "./AuthFields-CwIm0Cxd.mjs";
import { n as SocialButtons, t as AuthDivider } from "./SocialButtons-CEw1_IBb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-Bg90DQI6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hues = [
	205,
	235,
	186,
	250,
	168,
	196,
	145,
	220
];
var TOTAL = 4;
var MIN_CREATORS_TO_FOLLOW = 5;
function RegisterPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { signInConsumer } = useAuth();
	const [step, setStep] = (0, import_react.useState)(1);
	const [dir, setDir] = (0, import_react.useState)(1);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [dob, setDob] = (0, import_react.useState)("");
	const [hue, setHue] = (0, import_react.useState)(205);
	const [avatarMode, setAvatarMode] = (0, import_react.useState)("color");
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(null);
	const [uploadedAvatarUrl, setUploadedAvatarUrl] = (0, import_react.useState)(null);
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	const [bio, setBio] = (0, import_react.useState)("");
	const [isCreator, setIsCreator] = (0, import_react.useState)(true);
	const fileInputRef = (0, import_react.useRef)(null);
	const [selectedInterests, setSelectedInterests] = (0, import_react.useState)([]);
	const [topCreators, setTopCreators] = (0, import_react.useState)([]);
	const [loadingCreators, setLoadingCreators] = (0, import_react.useState)(false);
	const [selectedCreators, setSelectedCreators] = (0, import_react.useState)([]);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [availability, setAvailability] = (0, import_react.useState)("idle");
	const [formError, setFormError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
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
			api.get(`/auth/check-username?username=${encodeURIComponent(clean)}`).then((data) => setAvailability(data.status)).catch(() => setAvailability("error"));
		}, 500);
		return () => window.clearTimeout(t);
	}, [username]);
	(0, import_react.useEffect)(() => {
		if (step === 4 && topCreators.length === 0) {
			setLoadingCreators(true);
			const queryInterests = selectedInterests.join(",");
			api.get(`/users/top-creators?interests=${encodeURIComponent(queryInterests)}`).then((res) => {
				const list = res.users || [];
				setTopCreators(list);
				if (selectedCreators.length === 0 && list.length > 0) setSelectedCreators(list.slice(0, Math.min(5, list.length)).map((u) => u.username));
			}).catch(() => {}).finally(() => setLoadingCreators(false));
		}
	}, [
		step,
		selectedInterests,
		topCreators.length,
		selectedCreators.length
	]);
	const handlePhotoSelect = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please upload an image file (PNG, JPG, WEBP).");
			return;
		}
		if (file.size > 10485760) {
			toast.error("Image file size must be under 10MB.");
			return;
		}
		setAvatarFile(file);
		const localUrl = URL.createObjectURL(file);
		setAvatarPreview(localUrl);
		setAvatarMode("image");
		setUploadingAvatar(true);
		try {
			const res = await uploadFile("avatars", file);
			setUploadedAvatarUrl(res.url);
			toast.success("Profile photo uploaded!");
		} catch (err) {
			toast.error(err?.message || "Failed to upload profile photo. You can try again or use a colour.");
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
	const toggleInterest = (topic) => {
		setSelectedInterests((prev) => prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]);
	};
	const toggleFollowCreator = (uname) => {
		setSelectedCreators((prev) => prev.includes(uname) ? prev.filter((u) => u !== uname) : [...prev, uname]);
	};
	async function next() {
		const e = {};
		if (step === 1) {
			if (name.trim().length < 2) e.name = "Tell us your name.";
			if (!isEmail(email)) e.email = "Enter a valid email address.";
			if (passwordScore(password) < 2) e.password = "Choose a stronger password.";
		}
		if (step === 2) {
			if (availability === "error") e.username = "Couldn't check that handle — check your connection and try again.";
			else if (availability !== "free") e.username = "Pick an available handle (3–20 letters, numbers or _).";
			if (!dob) e.dob = "Add your date of birth.";
			else if (new Date(dob) > /* @__PURE__ */ new Date(Date.now() - 4102488e5)) e.dob = "You must be at least 13 years old.";
		}
		if (step === 3) {}
		if (step === 4) {
			if (selectedCreators.length < MIN_CREATORS_TO_FOLLOW) e.step4 = `Please follow at least ${MIN_CREATORS_TO_FOLLOW} creators or users to personalize your feed (${selectedCreators.length}/${MIN_CREATORS_TO_FOLLOW} selected).`;
		}
		setErrors(e);
		if (Object.keys(e).length) return;
		if (step < TOTAL) {
			setDir(1);
			setStep((s) => s + 1);
			return;
		}
		setFormError(null);
		setBusy(true);
		try {
			let finalAvatarUrl = uploadedAvatarUrl;
			if (avatarMode === "image" && avatarFile && !finalAvatarUrl) finalAvatarUrl = (await uploadFile("avatars", avatarFile)).url;
			const res = await api.post("/auth/register", {
				name: name.trim(),
				email: email.trim(),
				username: username.trim().toLowerCase(),
				password,
				avatarHue: hue,
				avatarUrl: avatarMode === "image" ? finalAvatarUrl : void 0,
				bio: bio.trim(),
				isCreator,
				interests: selectedInterests,
				followingUsernames: selectedCreators,
				onboarded: true
			});
			queryClient.setQueryData(["following-set"], { usernames: selectedCreators });
			queryClient.invalidateQueries({ queryKey: ["following-set"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["feed"] });
			signInConsumer(res.tokens, res.user);
			setBusy(false);
			toast.success("Welcome to Gihanga Updates!", { description: `Account created. Following ${selectedCreators.length} creators.` });
			navigate({ to: "/" });
		} catch (err) {
			setBusy(false);
			const message = err?.message || "Registration failed. Please try again.";
			setFormError(message);
			toast.error(message);
			if (/username/i.test(message)) setStep(2);
			else if (/email/i.test(message)) setStep(1);
		}
	}
	function back() {
		setDir(-1);
		setStep((s) => Math.max(1, s - 1));
	}
	const initials = name.trim().split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "G";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		title: step === 4 ? "What are you into?" : step === 3 ? "Build your profile" : "Create your account",
		subtitle: step === 4 ? `Pick topics and follow at least ${MIN_CREATORS_TO_FOLLOW} creators to shape your feed.` : step === 3 ? "Choose your account type, avatar and write a short bio." : "Four short steps and your personalized feed is ready.",
		back: {
			to: "/welcome",
			label: "Back to welcome"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepProgress, {
				step,
				total: TOTAL
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					initial: false,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							x: dir * 34
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: dir * -34
						},
						transition: {
							duration: .28,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						className: "space-y-4",
						children: [
							step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
									label: "Full name",
									icon: UserRound,
									placeholder: "Aline Mugisha",
									autoComplete: "name",
									value: name,
									error: errors.name,
									onChange: (e) => setName(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
									label: "Email",
									icon: Mail,
									type: "email",
									placeholder: "you@example.com",
									autoComplete: "email",
									value: email,
									error: errors.email,
									onChange: (e) => setEmail(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
										label: "Password",
										placeholder: "••••••••",
										autoComplete: "new-password",
										value: password,
										error: errors.password,
										onChange: (e) => setPassword(e.target.value)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordStrength, { value: password })]
								})
							] }),
							step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
								label: "Username",
								icon: AtSign,
								placeholder: "yourhandle",
								autoCapitalize: "none",
								value: username,
								error: errors.username,
								onChange: (e) => setUsername(e.target.value.replace(/\s/g, "")),
								hint: availability === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " Checking availability…"]
								}) : availability === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-success",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }),
										" @",
										username,
										" is available"
									]
								}) : availability === "taken" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-danger",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }),
										" @",
										username,
										" is already taken"
									]
								}) : availability === "invalid" ? "3–20 characters: letters, numbers or underscores." : availability === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-danger",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }), " Couldn't check availability — retype to try again."]
								}) : "This is how people will find and mention you."
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
								label: "Date of birth",
								icon: Cake,
								type: "date",
								value: dob,
								error: errors.dob,
								onChange: (e) => setDob(e.target.value),
								hint: "We never show this on your profile."
							})] }),
							step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold tracking-wide text-muted-foreground uppercase",
										children: "Account Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 gap-3 min-[420px]:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setIsCreator(false),
											className: cn("press rounded-2xl border p-3.5 text-left transition-all", !isCreator ? "border-primary bg-primary-soft text-primary font-bold shadow-soft" : "border-border bg-surface text-muted-foreground hover:bg-muted"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-5 mb-1.5" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold text-foreground",
													children: "Regular User"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] font-normal text-muted-foreground leading-snug mt-0.5",
													children: "Watch reels, follow creators, comment, and save posts."
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setIsCreator(true),
											className: cn("press rounded-2xl border p-3.5 text-left transition-all", isCreator ? "border-primary bg-primary-soft text-primary font-bold shadow-soft" : "border-border bg-surface text-muted-foreground hover:bg-muted"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 mb-1.5" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-bold text-foreground",
													children: "Creator"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] font-normal text-muted-foreground leading-snug mt-0.5",
													children: "Studio analytics, Go Live, Kingdom Points & cash payouts."
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 rounded-2xl border border-border/80 bg-surface/70 p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Profile Picture"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex shrink-0 items-center rounded-xl bg-muted p-0.5 text-xs font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setAvatarMode("color"),
													className: cn("rounded-lg px-2.5 py-1 transition-all", avatarMode === "color" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"),
													children: "Colour"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														setAvatarMode("image");
														if (!avatarPreview && fileInputRef.current) fileInputRef.current.click();
													},
													className: cn("rounded-lg px-2.5 py-1 transition-all", avatarMode === "image" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"),
													children: "Upload Photo"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative group shrink-0",
												children: [avatarMode === "image" && avatarPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative size-16 overflow-hidden rounded-full border-2 border-primary shadow-soft",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: avatarPreview,
														alt: "Profile preview",
														className: "size-full object-cover"
													}), uploadingAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "absolute inset-0 grid place-items-center bg-black/50 text-white",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" })
													})]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-16 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-primary-foreground shadow-soft",
													style: { backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${hue}), oklch(0.74 0.1 ${hue + 24}))` },
													children: initials
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"aria-label": "Upload photo",
													onClick: () => fileInputRef.current?.click(),
													className: "absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-3.5" })
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate font-display font-bold text-sm text-foreground",
														children: name || "Your name"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "truncate text-xs text-muted-foreground",
														children: [
															"@",
															username || "yourhandle",
															" ·",
															" ",
															isCreator ? "Creator Account" : "Regular User"
														]
													}),
													avatarMode === "image" && avatarPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 mt-1.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: () => fileInputRef.current?.click(),
																className: "text-xs font-semibold text-primary hover:underline",
																children: "Change photo"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground text-xs",
																children: "·"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																onClick: handleRemovePhoto,
																className: "text-xs font-semibold text-danger hover:underline",
																children: "Remove"
															})
														]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileInputRef,
											type: "file",
											accept: "image/png,image/jpeg,image/webp",
											className: "hidden",
											onChange: handlePhotoSelect
										}),
										avatarMode === "image" && !avatarPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => fileInputRef.current?.click(),
											className: "press flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary-soft/40 p-4 text-center cursor-pointer hover:bg-primary-soft/70 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid size-9 place-items-center rounded-full bg-primary/10 text-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold text-foreground",
												children: "Click to upload your profile photo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted-foreground",
												children: "PNG, JPG or WEBP up to 10MB"
											})] })]
										}),
										avatarMode === "color" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5 pt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] font-semibold text-muted-foreground",
												children: "Select an avatar color tone:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-2.5",
												children: hues.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"aria-label": `Avatar colour ${h}`,
													onClick: () => setHue(h),
													className: cn("press grid size-8 place-items-center rounded-full", hue === h && "ring-2 ring-ring ring-offset-2 ring-offset-background"),
													style: { backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${h}), oklch(0.74 0.1 ${h + 24}))` },
													children: hue === h && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-primary-foreground" })
												}, h))
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "bio",
											className: "block text-xs font-bold tracking-wide text-muted-foreground uppercase",
											children: "Short bio"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: "bio",
											rows: 2,
											maxLength: 160,
											value: bio,
											onChange: (e) => setBio(e.target.value),
											placeholder: "Storyteller from Kigali. Building things that matter.",
											className: "w-full resize-none rounded-2xl border border-border bg-surface/80 p-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:shadow-glow"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-right text-xs text-muted-foreground",
											children: [bio.length, "/160"]
										})
									]
								})
							] }),
							step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-bold tracking-wide text-muted-foreground uppercase",
											children: "What are you into?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-semibold text-primary",
											children: [selectedInterests.length, " topics selected"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-h-40 overflow-y-auto rounded-2xl border border-border/80 bg-surface/60 p-3 space-y-3 no-scrollbar",
										children: interestTopics.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
											children: group.category
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1.5",
											children: group.topics.map((topic) => {
												const on = selectedInterests.includes(topic);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													"aria-pressed": on,
													onClick: () => toggleInterest(topic),
													className: cn("press inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all", on ? "gradient-brand border-transparent text-primary-foreground shadow-xs font-bold" : "border-border bg-card text-foreground/80 hover:bg-muted"),
													children: [on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), topic]
												}, topic);
											})
										})] }, group.category))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs font-bold tracking-wide text-muted-foreground uppercase flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-primary" }), "Follow Top Creators & Users"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: [
													"Follow at least ",
													MIN_CREATORS_TO_FOLLOW,
													" creators to see their stories & posts"
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("rounded-full px-2.5 py-0.5 text-xs font-bold", selectedCreators.length >= MIN_CREATORS_TO_FOLLOW ? "bg-success/15 text-success" : "bg-warning/15 text-warning"),
												children: [
													selectedCreators.length,
													" / ",
													MIN_CREATORS_TO_FOLLOW
												]
											})]
										}),
										errors.step4 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "rounded-lg bg-danger/10 p-2 text-xs font-medium text-danger",
											children: errors.step4
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-h-64 overflow-y-auto rounded-2xl border border-border/80 bg-surface/60 p-2 space-y-2 no-scrollbar",
											children: loadingCreators ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col items-center justify-center py-8 text-muted-foreground gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs",
													children: "Finding the best creators for you…"
												})]
											}) : topCreators.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "py-6 text-center text-xs text-muted-foreground",
												children: "Loading creators…"
											}) : topCreators.map((creator) => {
												const isFollowing = selectedCreators.includes(creator.username);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: cn("flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors", isFollowing ? "bg-primary-soft/40 border border-primary/20" : "bg-card/70 hover:bg-muted/60"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2.5 min-w-0 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
															user: creator,
															size: "sm"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "min-w-0 flex-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-1",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "truncate font-bold text-xs text-foreground",
																		children: creator.name
																	}),
																	creator.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, { className: "size-3.5" }),
																	creator.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "shrink-0 rounded bg-primary/10 px-1 py-px text-[9px] font-bold text-primary",
																		children: "Creator"
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "truncate text-[11px] text-muted-foreground",
																children: [
																	"@",
																	creator.username,
																	" · ",
																	formatCount(creator.followersCount || 0),
																	" ",
																	"followers"
																]
															})]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "button",
														size: "sm",
														variant: isFollowing ? "brand" : "outline",
														onClick: () => toggleFollowCreator(creator.username),
														className: "h-11 min-h-11 max-[360px]:px-2.5 shrink-0 px-3 text-xs font-bold gap-1 rounded-xl",
														"aria-label": isFollowing ? `Unfollow ${creator.username}` : `Follow ${creator.username}`,
														children: isFollowing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "max-[360px]:hidden",
															children: "Following"
														})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "max-[360px]:hidden",
															children: "Follow"
														})] })
													})]
												}, creator._id || creator.username);
											})
										})
									]
								})]
							})
						]
					}, step)
				})
			}),
			formError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger",
				children: formError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col-reverse gap-2.5 max-[360px]:flex-col-reverse min-[361px]:flex-row",
				children: [step > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "lg",
					onClick: back,
					className: "min-w-0 flex-1 max-[360px]:w-full",
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: "Back"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					size: "lg",
					onClick: next,
					className: "min-w-0 flex-[2] max-[360px]:w-full",
					disabled: busy,
					children: [
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "shrink-0 animate-spin" }) : step === TOTAL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "shrink-0 size-4" }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0",
							children: step === TOTAL ? busy ? "Creating account…" : "Create account" : "Continue"
						}),
						!busy && step < TOTAL && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "shrink-0" })
					]
				})]
			}),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthDivider, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialButtons, { mode: "up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-center text-sm text-muted-foreground",
					children: [
						"Already have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "font-semibold text-primary hover:underline",
							children: "Sign in"
						})
					]
				})
			] })
		]
	});
}
//#endregion
export { RegisterPage as component };
