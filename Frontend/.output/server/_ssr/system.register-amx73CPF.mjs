import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as logo_default } from "./Logo-MIwGbQTL.mjs";
import { S as useNavigate, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ft as Mail, G as Shield, I as Sun, J as ShieldCheck, Rn as CircleAlert, Rt as Lock, St as Moon, Un as Check, ar as ArrowRight, dn as Eye, fn as EyeOff, g as UserPlus, m as User, or as ArrowLeft, rr as AtSign, xn as Crown, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { c as strengthLabels, l as useAuth, s as passwordScore } from "./auth-context-CsN3soau.mjs";
import { at as useTheme } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { o as hasPermission, t as ROLE_LABEL } from "./permissions-Bg62BCbG.mjs";
import { f as useStaffSetupStatus, r as useCreateStaff } from "./use-staff-management-C8FWGDdm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.register-amx73CPF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_CARDS = [
	{
		id: "moderator",
		title: "Moderator",
		badge: "Safety",
		blurb: "First line of defense for community safety.",
		perks: [
			"Review reports and AI safety flags",
			"Escalate harmful live streams",
			"View relevant user account context"
		],
		icon: ShieldCheck
	},
	{
		id: "admin",
		title: "Admin",
		badge: "Operations",
		blurb: "Full operational control of the platform.",
		perks: [
			"Manage platform users and content",
			"Review payments and ad campaigns",
			"View platform analytics"
		],
		icon: Shield
	},
	{
		id: "superadmin",
		title: "Super Admin",
		badge: "Full Access",
		blurb: "Complete command including staff and settings.",
		perks: [
			"Everything an Admin can",
			"Create and manage staff",
			"Control platform settings and security"
		],
		icon: Crown
	}
];
function StaffRegisterPage() {
	const navigate = useNavigate();
	const { staffUser, signInStaff } = useAuth();
	const { theme, toggle } = useTheme();
	const createStaff = useCreateStaff();
	const { data: setupStatus, isLoading: setupStatusLoading, isError: setupStatusError } = useStaffSetupStatus(!staffUser);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		username: "",
		email: "",
		password: "",
		bootstrapSecret: "",
		role: staffUser ? "moderator" : "superadmin"
	});
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [touched, setTouched] = (0, import_react.useState)({});
	const isBootstrap = !staffUser && setupStatus?.setupAvailable === true;
	const canProvision = staffUser ? hasPermission(staffUser, "staff.create") : isBootstrap;
	const strength = passwordScore(form.password);
	const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(form.username);
	const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
	const passwordValid = form.password.length >= 8;
	const bootstrapSecretValid = !isBootstrap || form.bootstrapSecret.length >= 32;
	const canSubmit = form.name.trim().length >= 2 && usernameValid && emailValid && passwordValid && bootstrapSecretValid && !createStaff.isPending;
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
				role: form.role,
				...isBootstrap ? { bootstrapSecret: form.bootstrapSecret } : {}
			});
			if (isBootstrap && result.tokens) {
				signInStaff(result.tokens, result.user);
				toast.success("Initial Super Admin account created", { description: `${result.user.name} (@${result.user.username}) is now signed in.` });
				navigate({ to: "/system/dashboard" });
			} else {
				toast.success("Staff account created successfully", { description: `${result.user.name} (@${result.user.username}) registered as ${ROLE_LABEL[result.user.role]}.` });
				navigate({ to: "/system/dashboard/staff" });
			}
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
	if (!staffUser && setupStatusLoading || !staffUser && !setupStatus && !setupStatusError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), " Checking secure staff setup…"]
		})
	});
	if (!canProvision) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-xl font-extrabold text-foreground",
					children: "Staff registration unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: staffUser ? "Only the Super Admin can create staff accounts." : setupStatusError ? "We couldn't verify whether initial setup is available. Try again later or contact the platform owner." : "The initial Super Admin setup has already been completed. Sign in with an authorized staff account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system",
					className: "press mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground",
					children: ["Go to staff sign in ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})
			]
		})
	});
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
								children: "The first setup creates the single initial Super Admin. After setup, only an authorized Super Admin can add Moderators and Admins."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: ROLE_CARDS.filter((r) => isBootstrap ? r.id === "superadmin" : r.id !== "superadmin").map((r, i) => {
							const Icon = r.icon;
							const isSelected = form.role === r.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
								type: "button",
								onClick: () => setForm((prev) => ({
									...prev,
									role: r.id
								})),
								initial: {
									opacity: 0,
									x: -14
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: { delay: .22 + i * .09 },
								className: cn("group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left backdrop-blur-md transition-all cursor-pointer", isSelected ? "border-white/50 bg-white/20 shadow-lg scale-[1.02]" : "border-white/15 bg-white/[0.06] hover:bg-white/12 hover:border-white/30"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-10 shrink-0 place-items-center rounded-xl border transition-colors", isSelected ? "border-white/60 bg-white text-[oklch(0.42_0.083_244)] shadow-sm" : "border-white/25 bg-white/10 text-white group-hover:bg-white/20"),
									children: isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5 stroke-[2.5]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-bold text-white",
											children: r.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/90",
											children: r.badge
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-white/70 line-clamp-1",
										children: r.blurb
									})]
								})]
							}, r.id);
						})
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
					className: "relative w-full max-w-[520px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-7 flex items-center gap-2 lg:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: logo_default,
								alt: "",
								className: "size-9 rounded-xl object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-base leading-tight font-extrabold text-foreground",
								children: isBootstrap ? "Initial Super Admin Setup" : "Register Staff Member"
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
										children: isBootstrap ? "Create the platform's first Super Admin account. This public setup closes after successful registration." : "Provision a Moderator or Admin with role-scoped operational privileges."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5" })
									})]
								}),
								staffUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground",
									children: [
										"Creating as ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: staffUser.name
										}),
										". Your current Super Admin session will remain active."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-6 space-y-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Select Role"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-semibold text-primary",
												children: [ROLE_LABEL[form.role], " Selected"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-3 gap-2.5",
											children: ROLE_CARDS.filter((r) => isBootstrap ? r.id === "superadmin" : r.id !== "superadmin").map((r) => {
												const Icon = r.icon;
												const isSelected = form.role === r.id;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setForm((prev) => ({
														...prev,
														role: r.id
													})),
													className: cn("group relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer", isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-sm text-foreground" : "border-border bg-elevated/70 text-muted-foreground hover:border-primary/40 hover:bg-card hover:text-foreground"),
													children: [
														isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-2.5 stroke-[3]" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: cn("mb-1.5 grid size-9 place-items-center rounded-xl transition-colors", isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary"),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs font-bold leading-tight",
															children: r.title
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-75",
															children: r.badge
														})
													]
												}, r.id);
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-2xl border border-primary/20 bg-primary-soft/30 p-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs font-bold text-primary",
													children: [ROLE_LABEL[form.role], " Scope:"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[11px] font-medium text-muted-foreground",
													children: ROLE_CARDS.find((r) => r.id === form.role)?.blurb
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-2 space-y-1",
												children: ROLE_CARDS.find((r) => r.id === form.role)?.perks.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "flex items-center gap-2 text-xs text-foreground/85",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: perk })]
												}, perk))
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: submit,
									className: "space-y-4",
									children: [
										isBootstrap && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "bootstrap-secret",
												className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "One-time setup secret"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "group relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "bootstrap-secret",
													type: "password",
													required: true,
													minLength: 32,
													autoComplete: "off",
													value: form.bootstrapSecret,
													onChange: (e) => setForm({
														...form,
														bootstrapSecret: e.target.value
													}),
													placeholder: "Enter STAFF_BOOTSTRAP_SECRET from backend environment",
													className: "h-12 w-full rounded-xl border border-border bg-elevated pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1.5 text-[11px] text-muted-foreground",
												children: "The platform owner must first configure a random secret of at least 32 characters in the backend environment. It is never stored in the user account."
											})
										] }),
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
											className: "press gradient-brand flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60 cursor-pointer",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3" }), isBootstrap ? "You will be signed in to the initial Super Admin account after setup." : "The new staff member receives separate credentials; your Super Admin session remains active."]
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
