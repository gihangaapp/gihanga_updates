import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-C5LwQkSU.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { G as ShieldCheck, I as Sparkles, Xt as Flame, p as Users } from "../_libs/lucide-react.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as AuthBackdrop } from "./AuthLayout-cw0K42Ps.mjs";
import { n as SocialButtons, t as AuthDivider } from "./SocialButtons-CEw1_IBb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/welcome-bFIuxLIH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var highlights = [
	{
		icon: Sparkles,
		title: "A feed with taste",
		body: "For you, Following and Trending — no noise."
	},
	{
		icon: Flame,
		title: "Stories & reels",
		body: "Go live, post vertical, keep the room warm."
	},
	{
		icon: Users,
		title: "Creator tools",
		body: "Drafts, scheduling and payouts in RWF."
	},
	{
		icon: ShieldCheck,
		title: "Safety first",
		body: "Granular controls over who sees what."
	}
];
function Welcome() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading || !user) return;
		if (!user.emailVerified) navigate({ to: "/verify" });
		else if (!user.onboarded) navigate({ to: "/interests" });
		else navigate({ to: "/" });
	}, [
		user,
		loading,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBackdrop, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gradient-brand pointer-events-none absolute -top-32 -left-24 size-[420px] rounded-full opacity-30 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "halo pointer-events-none absolute -right-32 bottom-0 size-[480px] rounded-full opacity-40 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .5,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								className: "font-display text-[46px] leading-[1.05] font-extrabold tracking-tight",
								children: [
									"The place where ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-brand",
										children: "Rwanda"
									}),
									" posts."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: {
									duration: .5,
									delay: .08,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								className: "mt-4 text-[15px] text-muted-foreground",
								children: "Stories, reels and updates from the creators shaping culture — with the tools to build an audience and get paid for it in RWF."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 grid gap-3 sm:grid-cols-2",
								children: highlights.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 16
									},
									animate: {
										opacity: 1,
										y: 0
									},
									transition: {
										duration: .4,
										delay: .14 + i * .06
									},
									className: "glass rounded-2xl p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(h.icon, { className: "size-5 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2.5 text-sm font-bold",
											children: h.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: h.body
										})
									]
								}, h.title))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex items-center gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Built for creators and viewers across East Africa."
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-8 lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-extrabold tracking-tight",
							children: "Get started"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Create an account in under a minute. Free, always."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-7 space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "brand",
								size: "lg",
								className: "w-full",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/register",
									children: "Create account"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "lg",
								className: "w-full",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: "I already have an account"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthDivider, { label: "or continue with" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialButtons, { mode: "up" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-xs leading-relaxed text-muted-foreground",
							children: "By continuing you agree to our Terms of Service and acknowledge our Privacy Policy."
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Welcome as component };
