import { o as __toESM } from "../_runtime.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, j as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/button-CJVUuoS8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("press inline-flex min-w-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
			brand: "gradient-brand text-primary-foreground shadow-glow hover:brightness-110",
			destructive: "bg-danger text-danger-foreground shadow-soft hover:bg-danger/90",
			outline: "border border-border-strong bg-surface hover:bg-muted",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
			soft: "bg-primary-soft text-primary hover:bg-primary-soft/70",
			ghost: "hover:bg-muted text-foreground",
			glass: "glass text-foreground shadow-soft hover:bg-surface/90",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-lg px-3 text-xs",
			lg: "h-11 min-h-11 rounded-2xl px-4 text-sm whitespace-normal [text-wrap:pretty] sm:h-12 sm:px-7 sm:text-base",
			icon: "h-10 w-10",
			"icon-sm": "h-8 w-8 rounded-lg",
			pill: "h-9 rounded-full px-4"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { buttonVariants as n, cn as r, Button as t };
