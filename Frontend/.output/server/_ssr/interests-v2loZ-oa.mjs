import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as Sparkles, Mt as LoaderCircle, On as Check } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { a as interestTopics, l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as AuthLayout } from "./AuthLayout-cw0K42Ps.mjs";
import { i as StepProgress } from "./AuthFields-CwIm0Cxd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interests-v2loZ-oa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MIN = 3;
function InterestsPage() {
	const navigate = useNavigate();
	const { updateConsumerProfile } = useAuth();
	const [picked, setPicked] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const toggle = (topic) => setPicked((p) => p.includes(topic) ? p.filter((t) => t !== topic) : [...p, topic]);
	function finish() {
		setBusy(true);
		api.patch("/auth/me", {
			interests: picked,
			onboarded: true
		}).then((data) => {
			updateConsumerProfile(data.user);
			setBusy(false);
			toast.success("Your feed is ready", { description: `${picked.length} topics selected.` });
			navigate({ to: "/" });
		}).catch((err) => {
			setBusy(false);
			toast.error(err?.message || "Couldn't save your interests. Please try again.");
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		wide: true,
		title: "What are you into?",
		subtitle: `Pick at least ${MIN} topics — we'll shape your For You feed around them.`,
		back: {
			to: "/verify",
			label: "Back to verification"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepProgress, {
				step: 1,
				total: 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				initial: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						x: 30
					},
					animate: {
						opacity: 1,
						x: 0
					},
					exit: {
						opacity: 0,
						x: -30
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
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-5",
						children: interestTopics.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2.5 text-xs font-bold tracking-wide text-muted-foreground uppercase",
							children: group.category
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: group.topics.map((topic) => {
								const on = picked.includes(topic);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": on,
									onClick: () => toggle(topic),
									className: cn("press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold", on ? "gradient-brand border-transparent text-primary-foreground shadow-glow" : "border-border bg-surface/70 text-foreground/80 hover:bg-muted"),
									children: [on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), topic]
								}, topic);
							})
						})] }, group.category))
					})
				}, "topics")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mr-auto text-sm text-muted-foreground",
					children: [
						picked.length,
						" selected",
						picked.length < MIN ? ` · ${MIN - picked.length} more` : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					size: "lg",
					onClick: finish,
					disabled: picked.length < MIN || busy,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), busy ? "Building your feed…" : "Enter Gihanga"]
				})]
			})
		]
	});
}
//#endregion
export { InterestsPage as component };
