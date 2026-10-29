import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as logo_default, t as Logo } from "./Logo-BWkMw83G.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as Sun, Ft as LoaderCircle, Jn as ArrowRight, On as CircleAlert, Pt as Lock, R as Sparkles, an as Eye, g as UserPlus, jt as Mail, nn as FingerprintPattern, on as EyeOff, q as ShieldCheck, r as Zap, yt as Moon } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { nt as useTheme } from "./router-CrddKQ7E.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.index-BQSf1MBJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var highlights = [
	{
		icon: ShieldCheck,
		title: "Role-based control",
		text: "Separate consoles for Super Admins, Admins and Moderators."
	},
	{
		icon: Zap,
		title: "Real-time oversight",
		text: "Live moderation queues, streams and payments as they happen."
	},
	{
		icon: Sparkles,
		title: "Smart insights",
		text: "Growth analytics and AI-assisted safety review built in."
	}
];
function StaffLoginPage() {
	const navigate = useNavigate();
	const { signInStaff, staffUser } = useAuth();
	const { theme, toggle } = useTheme();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [remember, setRemember] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			const data = await api.post("/system/auth/login", {
				email,
				password
			}, true);
			signInStaff(data.tokens, data.user);
			toast.success(`Welcome back, ${data.user.name}`, { description: `Signed in as ${ROLE_LABEL[data.user.role] ?? data.user.role}` });
			navigate({ to: "/system/dashboard" });
		} catch (err) {
			setError(err?.message || "Invalid staff credentials.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative hidden w-[46%] max-w-[640px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { backgroundImage: `linear-gradient(160deg, oklch(0.32 0.09 245), oklch(0.42 0.083 244) 42%, oklch(0.5 0.095 220) 74%, oklch(0.6 0.093 213))` }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0",
					style: { backgroundImage: "radial-gradient(circle at 18% 12%, oklch(0.76 0.083 187 / 0.35), transparent 40%), radial-gradient(circle at 85% 78%, oklch(0.42 0.083 244 / 0.5), transparent 46%), radial-gradient(circle at 55% 105%, oklch(0.6 0.093 213 / 0.4), transparent 42%)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-[0.07]",
					style: {
						backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
						backgroundSize: "44px 44px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					className: "pointer-events-none absolute top-[16%] right-[12%] size-40 rounded-full opacity-25 blur-2xl",
					style: { background: "oklch(0.76 0.083 187)" },
					animate: {
						y: [
							0,
							-18,
							0
						],
						x: [
							0,
							10,
							0
						]
					},
					transition: {
						duration: 9,
						repeat: Infinity,
						ease: "easeInOut"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					className: "pointer-events-none absolute bottom-[12%] left-[8%] size-56 rounded-full opacity-20 blur-3xl",
					style: { background: "oklch(0.42 0.083 244)" },
					animate: { y: [
						0,
						16,
						0
					] },
					transition: {
						duration: 11,
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
					transition: { duration: .5 },
					className: "relative flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-2xl bg-white/12 p-1 backdrop-blur-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: logo_default,
							alt: "Gihanga Updates",
							className: "size-9 object-contain"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-tight font-extrabold tracking-tight text-white",
						children: "Gihanga Updates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase",
						children: "Administration"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative space-y-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 18
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .55,
							delay: .12
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, { className: "size-3.5" }), " STAFF ACCESS ONLY"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-5 font-display text-[34px] leading-[1.12] font-extrabold tracking-tight text-white xl:text-[40px]",
								children: ["Command center for the", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block bg-clip-text text-transparent",
									style: { backgroundImage: "linear-gradient(90deg, oklch(0.9 0.05 195), oklch(0.76 0.083 187) 60%, oklch(0.85 0.09 170))" },
									children: "Gihanga community."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md text-[15px] leading-relaxed text-white/75",
								children: "Moderate content, manage accounts, oversee payments and watch the platform grow — all from one beautifully calm console."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: highlights.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								x: -16
							},
							animate: {
								opacity: 1,
								x: 0
							},
							transition: {
								duration: .45,
								delay: .25 + i * .1
							},
							className: "flex items-start gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(h.icon, { className: "size-[18px]" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-white",
								children: h.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[13px] leading-relaxed text-white/65",
								children: h.text
							})] })]
						}, h.title))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					transition: { delay: .6 },
					className: "relative text-[11px] font-medium tracking-wide text-white/45",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" Gihanga Updates · Ocean Deep Administration Suite"
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-60 dark:opacity-30",
					style: { backgroundImage: "radial-gradient(circle at 80% 10%, oklch(0.76 0.083 187 / 0.12), transparent 45%), radial-gradient(circle at 10% 90%, oklch(0.6 0.093 213 / 0.1), transparent 42%)" }
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
					className: "relative w-full max-w-[420px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8 flex flex-col items-center gap-3 text-center lg:hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
									compact: true,
									className: "scale-125"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-lg font-extrabold tracking-tight",
										children: "Admin Console"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Moderator · Admin · Super Admin access"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl border border-border bg-card/80 p-7 shadow-float backdrop-blur-xl sm:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-6 hidden items-center gap-2 text-foreground lg:flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-lg font-extrabold tracking-tight",
										children: "Sign in to console"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: submit,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "staff-email",
											className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
											children: "Staff email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "group relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "staff-email",
												type: "email",
												required: true,
												autoComplete: "username",
												value: email,
												onChange: (e) => setEmail(e.target.value),
												placeholder: "you@gihanga.rw",
												className: "h-12 w-full rounded-xl border border-border bg-elevated pr-4 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10"
											})]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mb-1.5 flex items-center justify-between",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "staff-password",
												className: "block text-xs font-bold tracking-wide text-muted-foreground uppercase",
												children: "Password"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "group relative",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "staff-password",
													type: showPassword ? "text" : "password",
													required: true,
													autoComplete: "current-password",
													value: password,
													onChange: (e) => setPassword(e.target.value),
													placeholder: "Enter your password",
													className: "h-12 w-full rounded-xl border border-border bg-elevated pr-11 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/10"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"aria-label": showPassword ? "Hide password" : "Show password",
													onClick: () => setShowPassword((v) => !v),
													className: "press absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
													children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
												})
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-between",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted-foreground select-none",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													onClick: () => setRemember(!remember),
													className: `grid size-4.5 place-items-center rounded-md border transition-colors ${remember ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-elevated"}`,
													children: remember && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
														viewBox: "0 0 12 12",
														className: "size-3",
														fill: "none",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
															d: "M2.5 6.5L5 9l4.5-5.5",
															stroke: "currentColor",
															strokeWidth: "2",
															strokeLinecap: "round",
															strokeLinejoin: "round"
														})
													})
												}), "Keep me signed in"]
											})
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
											disabled: busy,
											className: "press gradient-brand relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60",
											children: [
												!busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
													className: "absolute inset-0 bg-white/15",
													initial: { x: "-100%" },
													whileHover: { x: "100%" },
													transition: { duration: .6 }
												}),
												busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "relative",
													children: busy ? "Verifying credentials…" : "Sign in to console"
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "my-6 flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase",
											children: "or"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/system/register",
									className: "press group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4 text-primary" }),
										"Register an administrator",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 text-center text-xs leading-relaxed text-muted-foreground",
							children: ["Regular Gihanga Updates accounts can't sign in here — this console is reserved for platform staff. ", staffUser ? "You already have an active staff session." : ""]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { StaffLoginPage as component };
