import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { nt as useTheme } from "./router-CrddKQ7E.mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, s as Area, t as AreaChart, u as Bar } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminCharts-CshwxwoM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK = {
	c1: "oklch(0.6 0.093 213)",
	c2: "oklch(0.76 0.083 187)",
	c3: "oklch(0.42 0.083 244)",
	c4: "oklch(0.79 0.145 78)",
	c5: "oklch(0.66 0.145 158)",
	grid: "oklch(0.914 0.011 226 / 0.7)",
	axis: "oklch(0.53 0.032 245)",
	card: "oklch(1 0 0)",
	border: "oklch(0.914 0.011 226)",
	fg: "oklch(0.222 0.05 254)"
};
function useChartPalette() {
	const { theme } = useTheme();
	const [palette, setPalette] = (0, import_react.useState)(FALLBACK);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const root = document.documentElement;
		const read = (name, fb) => {
			return getComputedStyle(root).getPropertyValue(name).trim() || fb;
		};
		setPalette({
			c1: read("--chart-1", FALLBACK.c1),
			c2: read("--chart-2", FALLBACK.c2),
			c3: read("--chart-3", FALLBACK.c3),
			c4: read("--chart-4", FALLBACK.c4),
			c5: read("--chart-5", FALLBACK.c5),
			grid: read("--border", FALLBACK.grid),
			axis: read("--muted-foreground", FALLBACK.axis),
			card: read("--card", FALLBACK.card),
			border: read("--border-strong", FALLBACK.border),
			fg: read("--foreground", FALLBACK.fg)
		});
	}, [theme]);
	return palette;
}
function ChartTooltipCard({ title, entries, palette }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-[140px] rounded-xl border p-3 shadow-float backdrop-blur-md",
		style: {
			background: palette.card,
			borderColor: palette.border
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs font-bold",
			style: { color: palette.fg },
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: entries.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					style: { color: palette.axis },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-2 rounded-full",
						style: { background: e.color }
					}), e.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold tabular-nums",
					style: { color: palette.fg },
					children: typeof e.value === "number" ? e.value.toLocaleString() : e.value
				})]
			}, i))
		})]
	});
}
function makeTooltip(palette, labelFormatter) {
	return ({ active, payload, label }) => {
		if (!active || !payload?.length) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipCard, {
			title: labelFormatter ? labelFormatter(String(label)) : String(label),
			entries: payload.map((p) => ({
				name: p.name,
				value: p.value,
				color: p.color
			})),
			palette
		});
	};
}
function AdminLineChart({ data, series, height = 280, xKey = "label" }) {
	const p = useChartPalette();
	const colorOf = (i) => ({
		1: p.c1,
		2: p.c2,
		3: p.c3,
		4: p.c4,
		5: p.c5
	})[i ?? 1] ?? p.c1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					bottom: 0,
					left: -14
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: p.grid,
						strokeDasharray: "4 4",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: xKey,
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						dy: 6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						width: 52,
						tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}k` : String(v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: makeTooltip(p),
						cursor: {
							stroke: p.grid,
							strokeWidth: 1
						}
					}),
					series.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: s.key,
						name: s.name,
						stroke: colorOf(s.colorIndex ?? i % 5 + 1),
						strokeWidth: 2.5,
						dot: false,
						activeDot: {
							r: 4,
							strokeWidth: 2
						},
						animationDuration: 900,
						animationBegin: i * 120
					}, s.key))
				]
			})
		})
	});
}
function AdminDonutChart({ data, centerLabel, centerValue, height = 220 }) {
	const p = useChartPalette();
	const colorOf = (i) => ({
		1: p.c1,
		2: p.c2,
		3: p.c3,
		4: p.c4,
		5: p.c5
	})[i ?? 1] ?? p.c1;
	const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		style: { height },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload }) => {
				if (!active || !payload?.length) return null;
				const item = payload[0];
				const pct = (item.value / total * 100).toFixed(1);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipCard, {
					title: item.name,
					entries: [{
						name: "Count",
						value: item.value
					}, {
						name: "Share",
						value: `${pct}%`
					}],
					palette: p
				});
			} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "name",
				innerRadius: "68%",
				outerRadius: "94%",
				paddingAngle: 3,
				cornerRadius: 6,
				stroke: "none",
				animationDuration: 900,
				onMouseEnter: (_, i) => setActiveIndex(i),
				children: data.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
					fill: colorOf(d.colorIndex ?? i % 5 + 1),
					opacity: i === activeIndex ? 1 : .55,
					style: {
						transition: "opacity 0.2s ease",
						outline: "none"
					}
				}, d.name))
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-2xl font-extrabold tracking-tight text-foreground tabular-nums",
				children: centerValue
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 max-w-[90px] truncate text-[11px] font-medium text-muted-foreground",
				children: centerLabel
			})]
		})]
	});
}
var barGradId = 0;
function AdminBarChart({ data, dataKey = "value", xKey = "label", height = 240, colorIndex = 1 }) {
	const p = useChartPalette();
	const [gradId] = (0, import_react.useState)(() => `adminBarGrad-${++barGradId}`);
	({
		1: p.c1,
		2: p.c2,
		3: p.c3,
		4: p.c4,
		5: p.c5
	})[colorIndex] ?? p.c1;
	const last = data.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				margin: {
					top: 8,
					right: 4,
					bottom: 0,
					left: -18
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: gradId,
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: p.c1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: p.c3
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: p.grid,
						strokeDasharray: "4 4",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: xKey,
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						dy: 6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						width: 48,
						tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : String(v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: makeTooltip(p),
						cursor: {
							fill: p.grid,
							opacity: .4
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey,
						radius: [
							6,
							6,
							0,
							0
						],
						animationDuration: 800,
						children: data.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							fill: i === last ? `url(#${gradId})` : p.c2,
							opacity: i === last ? 1 : .45
						}, i))
					})
				]
			})
		})
	});
}
var areaGradId = 0;
function AdminAreaChart({ data, dataKey = "value", xKey = "label", height = 260, colorIndex = 1 }) {
	const p = useChartPalette();
	const [gradId] = (0, import_react.useState)(() => `adminAreaGrad-${++areaGradId}`);
	const color = {
		1: p.c1,
		2: p.c2,
		3: p.c3,
		4: p.c4,
		5: p.c5
	}[colorIndex] ?? p.c1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { height },
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					bottom: 0,
					left: -14
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: gradId,
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: color,
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: color,
							stopOpacity: .02
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: p.grid,
						strokeDasharray: "4 4",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: xKey,
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						dy: 6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tickLine: false,
						axisLine: false,
						tick: {
							fill: p.axis,
							fontSize: 11
						},
						width: 48,
						tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : String(v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: makeTooltip(p) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey,
						stroke: color,
						strokeWidth: 2.5,
						fill: `url(#${gradId})`,
						animationDuration: 900
					})
				]
			})
		})
	});
}
function AdminProgressRow({ label, value, display, meta, delay = 0, colorIndex = 1 }) {
	const p = useChartPalette();
	const color = {
		1: p.c1,
		2: p.c2,
		3: p.c3,
		4: p.c4,
		5: p.c5
	}[colorIndex] ?? p.c1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-[13px] font-semibold text-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-base font-extrabold text-foreground tabular-nums",
				children: display
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 h-1.5 overflow-hidden rounded-full bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full transition-[width] duration-700",
				style: {
					width: `${Math.max(2, Math.min(100, value))}%`,
					background: `linear-gradient(90deg, ${p.c3}, ${color})`
				}
			})
		}),
		meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-[11px] text-muted-foreground",
			children: meta
		})
	] });
}
//#endregion
export { AdminProgressRow as a, AdminLineChart as i, AdminBarChart as n, AdminDonutChart as r, AdminAreaChart as t };
