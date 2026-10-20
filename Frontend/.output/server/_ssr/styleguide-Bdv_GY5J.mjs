import { t as Button } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-C5LwQkSU.mjs";
import { I as Sparkles, Ut as Heart, Z as Send, at as Radio } from "../_libs/lucide-react.mjs";
import { It as Switch, S as UserName, h as Input, n as Badge, p as GAvatar, t as AppShell } from "./router-Dh25U3j0.mjs";
import { t as Progress } from "./progress-BaJBfUMd.mjs";
import { t as PostSkeleton } from "./PostSkeleton-BQJvHS--.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/styleguide-Bdv_GY5J.js
var import_jsx_runtime = require_jsx_runtime();
var currentUser = {
	id: "u0",
	name: "Amina Uwase",
	username: "amina",
	avatarHue: 250,
	avatarUrl: null,
	verified: true
};
var users = [
	{
		id: "u1",
		name: "Bosco Nkusi",
		username: "bosco",
		avatarHue: 12
	},
	{
		id: "u2",
		name: "Claudine Ingabire",
		username: "claudine",
		avatarHue: 120
	},
	{
		id: "u3",
		name: "David Kalisa",
		username: "david",
		avatarHue: 200
	},
	{
		id: "u4",
		name: "Esther Mukamana",
		username: "esther",
		avatarHue: 300
	},
	{
		id: "u5",
		name: "Fabrice Habimana",
		username: "fabrice",
		avatarHue: 60
	},
	{
		id: "u6",
		name: "Grace Nyiramana",
		username: "grace",
		avatarHue: 170,
		verified: true
	}
];
var swatches = [
	[
		"Primary",
		"bg-primary",
		"text-primary-foreground"
	],
	[
		"Accent",
		"bg-accent",
		"text-accent-foreground"
	],
	[
		"Aqua",
		"bg-aqua",
		"text-aqua-foreground"
	],
	[
		"Success",
		"bg-success",
		"text-success-foreground"
	],
	[
		"Warning",
		"bg-warning",
		"text-warning-foreground"
	],
	[
		"Danger",
		"bg-danger",
		"text-danger-foreground"
	],
	[
		"Info",
		"bg-info",
		"text-info-foreground"
	],
	[
		"Surface",
		"bg-surface border border-border",
		"text-foreground"
	],
	[
		"Elevated",
		"bg-elevated",
		"text-foreground"
	],
	[
		"Muted",
		"bg-muted",
		"text-muted-foreground"
	]
];
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface-card mb-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 font-display text-lg font-bold",
			children: title
		}), children]
	});
}
function Styleguide() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[760px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "halo surface-card mb-4 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl",
						children: [
							"The ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-brand",
								children: "Ocean Deep"
							}),
							" design system"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-prose text-muted-foreground",
						children: "Every color, radius, shadow and motion curve used across Gihanga Updates lives here as a semantic token. Phase 1 foundations."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Color tokens",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-5",
					children: swatches.map(([name, bg, fg]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `grid h-20 place-items-center rounded-2xl ${bg}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs font-bold ${fg}`,
							children: name
						})
					}, name))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gradient-brand mt-3 grid h-16 place-items-center rounded-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold text-primary-foreground",
						children: "Brand gradient"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Typography",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-4xl font-extrabold tracking-tight",
							children: "Display / Sora 800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-bold",
							children: "Heading / Sora 700"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: "Subtitle / Manrope 600"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "leading-relaxed text-foreground/85",
							children: "Body / Manrope 400 — readable at every size, tuned for long captions and comment threads without feeling like a document."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.14em] text-muted-foreground uppercase",
							children: "Overline / Manrope 500"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Buttons",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), " Brand"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Default" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "soft",
							children: "Soft"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							children: "Secondary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							children: "Outline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							children: "Ghost"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "glass",
							children: "Glass"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "destructive",
							children: "Danger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							children: "Link"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							"aria-label": "Like",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "pill",
							variant: "soft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {}), " Go live"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: true,
							children: "Disabled"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Avatars & identity",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: currentUser,
							size: "xl",
							ring: "story"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: users[0],
							size: "lg",
							ring: "live"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: users[1],
							size: "md",
							ring: "seen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: users[2],
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: users[3],
							size: "xs"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
						user: users[0],
						showHandle: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
						user: users[5],
						showHandle: true
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Badges, inputs & controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Creator" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: "Following"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: "Draft"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "destructive",
								children: "Live"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "Search creators…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Disabled",
							disabled: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "sg-switch",
							defaultChecked: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "sg-switch",
							className: "text-sm font-medium",
							children: "Autoplay videos"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-muted-foreground",
							children: "Upload progress · 68% · 2 of 3 files"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: 68 })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Elevation & motion",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lift grid h-24 place-items-center rounded-2xl bg-surface shadow-soft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold",
								children: "shadow-soft · lift"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-24 place-items-center rounded-2xl bg-surface shadow-float",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold",
								children: "shadow-float"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "gradient-brand animate-float grid h-24 place-items-center rounded-2xl shadow-glow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-primary-foreground",
								children: "shadow-glow · float"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Loading states",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Empty state",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid place-items-center rounded-2xl border border-dashed border-border-strong py-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "gradient-brand grid size-14 place-items-center rounded-2xl shadow-glow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-6 text-primary-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-display text-lg font-bold",
							children: "No updates yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xs text-sm text-muted-foreground",
							children: "When creators you follow post, their updates will land right here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							className: "mt-4",
							children: "Discover creators"
						})
					]
				})
			})
		]
	}) });
}
//#endregion
export { Styleguide as component };
