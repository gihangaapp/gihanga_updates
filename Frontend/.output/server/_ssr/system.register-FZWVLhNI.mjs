import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as logo_default } from "./Logo-BWkMw83G.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as Sun, Ft as LoaderCircle, Kn as AtSign, Nn as Check, On as CircleAlert, Pt as Lock, Yn as ArrowLeft, an as Eye, g as UserPlus, jt as Mail, m as User, on as EyeOff, q as ShieldCheck, yt as Moon } from "../_libs/lucide-react.mjs";
import { nt as useTheme } from "./router-CrddKQ7E.mjs";
import { c as strengthLabels, l as useAuth, s as passwordScore } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { r as useCreateStaff } from "./use-staff-management-92jpC5YJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.register-FZWVLhNI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_CARDS = [
	{
		id: "moderator",
		title: "Moderator",
		blurb: "First line of defense for community safety.",
		perks: [
			"Review reports & AI flags",
			"Watch live streams",
			"View accounts"
		]
	},
	{
		id: "admin",
		title: "Admin",
		blurb: "Full operational control of the platform.",
		perks: [
			"Everything a Moderator can",
			"Suspend / ban accounts",
			"Approve payments & ads"
		]
	},
	{
		id: "superadmin",
		title: "Super Admin",
		blurb: "Complete command including staff and settings.",
		perks: [
			"Everything an Admin can",
			"Register & manage staff",
			"Platform settings & flags"
		]
	}
];
function StaffRegisterPage() {
	const navigate = useNavigate();
	const { staffUser, signInStaff } = useAuth();
	const { theme, toggle } = useTheme();
	const createStaff = useCreateStaff();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		username: "",
		email: "",
		password: "",
		role: "moderator"
	});
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [touched, setTouched] = (0, import_react.useState)({});
	const isSuperadmin = staffUser?.role === "superadmin";
	const strength = passwordScore(form.password);
	const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(form.username);
	const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
	const passwordValid = form.password.length >= 8;
	const canSubmit = form.name.trim().length >= 2 && usernameValid && emailValid && passwordValid && !createStaff.isPending;
	async function submit(e) {
		e.preventDefault();
		setError(null);
		if (!canSubmit) {
			setTouched({
				username: true,
				email: true,
				password: true,
				name: true
			});
			return;
		}
		try {
			const result = await createStaff.mutateAsync({
				name: form.name.trim(),
				username: form.username.trim().toLowerCase(),
				email: form.email.trim().toLowerCase(),
				password: form.password,
				role: form.role
			});
			signInStaff(result.tokens, result.user);
			toast.success(`Administrator registered — signed in as ${ROLE_LABEL[result.user.role]}.`, { description: `${result.user.name} (@${result.user.username}) now has ${ROLE_LABEL[result.user.role]} access.` });
			navigate({ to: "/system/dashboard" });
		} catch (err) {
			setError(err?.message || "Couldn't register this administrator.");
		}
	}
	const strengthTone = (0, import_react.useMemo)(() => [
		"bg-danger",
		"bg-danger",
		"bg-warning",
		"bg-info",
		"bg-success"
	][strength], [strength]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative hidden w-[38%] max-w-[540px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { backgroundImage: `linear-gradient(165deg, oklch(0.3 0.085 248), oklch(0.42 0.083 244) 46%, oklch(0.52 0.095 218))` }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0",
					style: { backgroundImage: "radial-gradient(circle at 20% 85%, oklch(0.76 0.083 187 / 0.3), transparent 42%), radial-gradient(circle at 90% 15%, oklch(0.42 0.083 244 / 0.45), transparent 45%)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					className: "pointer-events-none absolute top-[22%] right-[14%] size-36 rounded-full opacity-20 blur-2xl",
					style: { background: "oklch(0.76 0.083 187)" },
					animate: { y: [
						0,
						-14,
						0
					] },
					transition: {
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 14
					},
					animate: {
						opacity: 1,
						y: 0
					},
					className: "relative flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-2xl bg-white/12 p-1 backdrop-blur-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: logo_default,
							alt: "Gihanga Updates",
							className: "size-8 object-contain"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-extrabold tracking-tight text-white",
						children: "Gihanga Updates"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative space-y-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 18
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { delay: .1 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" }), " STAFF REGISTRATION"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-5 font-display text-[32px] leading-[1.15] font-extrabold tracking-tight text-white xl:text-[36px]",
								children: ["Grow your", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block bg-clip-text text-transparent",
									style: { backgroundImage: "linear-gradient(90deg, oklch(0.9 0.05 195), oklch(0.76 0.083 187) 60%, oklch(0.85 0.09 170))" },
									children: "administration team."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-sm text-[15px] leading-relaxed text-white/75",
								children: "Register Moderators, Admins and Super Admins — each with a scoped set of permissions that matches their responsibility."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3.5",
						children: ROLE_CARDS.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								x: -14
							},
							animate: {
								opacity: 1,
								x: 0
							},
							transition: { delay: .22 + i * .09 },
							className: cn("flex items-center gap-3.5 rounded-2xl border p-4 backdrop-blur-md transition-colors", form.role === r.id ? "border-white/45 bg-white/15" : "border-white/15 bg-white/[0.06] hover:bg-white/10"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-9 shrink-0 place-items-center rounded-xl border", form.role === r.id ? "border-white/50 bg-white text-[oklch(0.42_0.083_244)]" : "border-white/25 bg-white/10 text-white"),
								children: form.role === r.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-white",
								children: r.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/65",
								children: r.blurb
							})] })]
						}, r.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "relative text-[11px] font-medium tracking-wide text-white/45",
					children: "Role permissions follow the platform's RBAC matrix."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-60 dark:opacity-30",
					style: { backgroundImage: "radial-gradient(circle at 15% 15%, oklch(0.76 0.083 187 / 0.12), transparent 45%), radial-gradient(circle at 90% 85%, oklch(0.6 0.093 213 / 0.1), transparent 42%)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Toggle theme",
					onClick: toggle,
					className: "press absolute top-5 right-5 grid size-10 place-items-center rounded-xl border border-border bg-card/70 text-muted-foreground backdrop-blur",
					children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 20
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .55,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: "relative w-full max-w-[480px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-7 flex items-center gap-2 lg:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: logo_default,
								alt: "",
								className: "size-9 rounded-xl object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-base leading-tight font-extrabold text-foreground",
								children: "Register Administrator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-bold tracking-[0.16em] text-primary uppercase",
								children: "Gihanga Updates"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-border bg-card/80 p-7 shadow-float backdrop-blur-xl sm:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-6 flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-xl font-extrabold tracking-tight text-foreground",
										children: "Create a staff account"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[13px] text-muted-foreground",
										children: isSuperadmin ? "You're registering as a Super Admin — all roles are available." : "Only a signed-in Super Admin can register new administrators."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5" })
									})]
								}),
								!isSuperadmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										height: 0
									},
									animate: {
										opacity: 1,
										height: "auto"
									},
									className: "mb-5 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-xs font-semibold leading-relaxed text-warning",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 shrink-0" }), "The backend will reject this request unless a Super Admin session is active. Sign in as a Super Admin first, or share this page with one."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 lg:hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase",
										children: "Role"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-2",
										children: ROLE_CARDS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setForm({
												...form,
												role: r.id
											}),
											className: cn("rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors", form.role === r.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-elevated text-muted-foreground hover:text-foreground"),
											children: r.title
										}, r.id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: submit,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Full name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "group relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													required: true,
													minLength: 2,
													maxLength: 64,
													autoComplete: "name",
													value: form.name,
													onChange: (e) => setForm({
														...form,
														name: e.target.value
													}),
													onBlur: () => setTouched((t) => ({
														...t,
														name: true
													})),
													placeholder: "Jane Uwase",
													className: cn("h-11 w-full rounded-xl border bg-elevated pr-3.5 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10", touched["name"] && form.name.trim().length < 2 ? "border-danger/60" : "border-border")
												})]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Username"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "group relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													required: true,
													minLength: 3,
													maxLength: 20,
													pattern: "[a-zA-Z0-9_]{3,20}",
													autoComplete: "username",
													value: form.username,
													onChange: (e) => setForm({
														...form,
														username: e.target.value
													}),
													onBlur: () => setTouched((t) => ({
														...t,
														username: true
													})),
													placeholder: "jane_uwase",
													className: cn("h-11 w-full rounded-xl border bg-elevated pr-3.5 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10", touched["username"] && !usernameValid ? "border-danger/60" : "border-border")
												})]
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
											children: "Work email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "group relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												required: true,
												type: "email",
												autoComplete: "email",
												value: form.email,
												onChange: (e) => setForm({
													...form,
													email: e.target.value
												}),
												onBlur: () => setTouched((t) => ({
													...t,
													email: true
												})),
												placeholder: "jane@gihanga.rw",
												className: cn("h-11 w-full rounded-xl border bg-elevated pr-4 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10", touched["email"] && !emailValid ? "border-danger/60" : "border-border")
											})]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Temporary password"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "group relative",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														required: true,
														type: showPassword ? "text" : "password",
														minLength: 8,
														maxLength: 72,
														autoComplete: "new-password",
														value: form.password,
														onChange: (e) => setForm({
															...form,
															password: e.target.value
														}),
														onBlur: () => setTouched((t) => ({
															...t,
															password: true
														})),
														placeholder: "Minimum 8 characters",
														className: cn("h-11 w-full rounded-xl border bg-elevated pr-11 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10", touched["password"] && !passwordValid ? "border-danger/60" : "border-border")
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														"aria-label": showPassword ? "Hide password" : "Show password",
														onClick: () => setShowPassword((v) => !v),
														className: "press absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
														children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
													})
												]
											}),
											form.password && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex gap-1.5",
													children: [
														0,
														1,
														2,
														3
													].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 flex-1 rounded-full transition-colors", i < strength ? strengthTone : "bg-muted") }, i))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1.5 text-[11px] font-semibold text-muted-foreground",
													children: [
														"Strength: ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground",
															children: strengthLabels[strength]
														}),
														" — mix letters, numbers & symbols"
													]
												})]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "hidden rounded-xl border border-primary/20 bg-primary-soft/40 p-3.5 lg:block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs font-bold text-primary",
												children: [ROLE_LABEL[form.role], " will be able to:"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-1.5 space-y-1",
												children: ROLE_CARDS.find((r) => r.id === form.role)?.perks.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "flex items-center gap-2 text-xs text-foreground/80",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-primary" }),
														" ",
														perk
													]
												}, perk))
											})]
										}),
										error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
											initial: {
												opacity: 0,
												height: 0,
												y: -4
											},
											animate: {
												opacity: 1,
												height: "auto",
												y: 0,
												x: [
													0,
													-6,
													6,
													-3,
													3,
													0
												]
											},
											transition: { duration: .45 },
											className: "flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-xs font-semibold text-danger",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 shrink-0" }), error]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: !canSubmit,
											className: "press gradient-brand flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60",
											children: [createStaff.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), createStaff.isPending ? "Creating account…" : `Register ${ROLE_LABEL[form.role]}`]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/system",
								className: "press group flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5 transition-transform group-hover:-translate-x-0.5" }), "Back to staff sign-in"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-[11px] text-muted-foreground/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3" }), " Creating an account signs you into it immediately"]
							})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { StaffRegisterPage as component };
