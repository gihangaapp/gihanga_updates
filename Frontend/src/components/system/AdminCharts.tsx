import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/hooks/use-theme";

/*
 * Theme-aware chart set for the admin console. Colors are read live from the
 * Gihanga design tokens (--chart-1..5) so every chart follows the Ocean Deep
 * palette in both light and dark mode instead of hardcoding hex values.
 */

export interface ChartPalette {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
  grid: string;
  axis: string;
  card: string;
  border: string;
  fg: string;
}

const FALLBACK: ChartPalette = {
  c1: "oklch(0.6 0.093 213)",
  c2: "oklch(0.76 0.083 187)",
  c3: "oklch(0.42 0.083 244)",
  c4: "oklch(0.79 0.145 78)",
  c5: "oklch(0.66 0.145 158)",
  grid: "oklch(0.914 0.011 226 / 0.7)",
  axis: "oklch(0.53 0.032 245)",
  card: "oklch(1 0 0)",
  border: "oklch(0.914 0.011 226)",
  fg: "oklch(0.222 0.05 254)",
};

export function useChartPalette(): ChartPalette {
  const { theme } = useTheme();
  const [palette, setPalette] = useState<ChartPalette>(FALLBACK);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const read = (name: string, fb: string) => {
      const v = getComputedStyle(root).getPropertyValue(name).trim();
      return v || fb;
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
      fg: read("--foreground", FALLBACK.fg),
    });
  }, [theme]);

  return palette;
}

/* ── Shared FlowMail-style tooltip ────────────────────────────────────────── */

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}

function ChartTooltipCard({
  title,
  entries,
  palette,
}: {
  title: string;
  entries: TooltipEntry[];
  palette: ChartPalette;
}) {
  return (
    <div
      className="min-w-[140px] rounded-xl border p-3 shadow-float backdrop-blur-md"
      style={{ background: palette.card, borderColor: palette.border }}
    >
      <p className="mb-2 text-xs font-bold" style={{ color: palette.fg }}>
        {title}
      </p>
      <div className="space-y-1.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5" style={{ color: palette.axis }}>
              <span className="size-2 rounded-full" style={{ background: e.color }} />
              {e.name}
            </span>
            <span className="font-bold tabular-nums" style={{ color: palette.fg }}>
              {typeof e.value === "number" ? e.value.toLocaleString() : e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function makeTooltip(palette: ChartPalette, labelFormatter?: (label: string) => string) {
  return ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <ChartTooltipCard
        title={labelFormatter ? labelFormatter(String(label)) : String(label)}
        entries={payload.map((p: any) => ({ name: p.name, value: p.value, color: p.color }))}
        palette={palette}
      />
    );
  };
}

/* ── Multi-series line chart ──────────────────────────────────────────────── */

export function AdminLineChart({
  data,
  series,
  height = 280,
  xKey = "label",
}: {
  data: Record<string, any>[];
  series: { key: string; name: string; colorIndex?: 1 | 2 | 3 | 4 | 5 }[];
  height?: number;
  xKey?: string;
}) {
  const p = useChartPalette();
  const colorOf = (i: number | undefined) =>
    ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[i ?? 1] ?? p.c1;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <CartesianGrid stroke={p.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            width={52}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(v))}
          />
          <Tooltip content={makeTooltip(p)} cursor={{ stroke: p.grid, strokeWidth: 1 }} />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={colorOf(s.colorIndex ?? ((i % 5) + 1))}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              animationDuration={900}
              animationBegin={i * 120}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Donut chart with center label ────────────────────────────────────────── */

export function AdminDonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
}: {
  data: { name: string; value: number; colorIndex?: 1 | 2 | 3 | 4 | 5 }[];
  centerLabel: string;
  centerValue: string;
  height?: number;
}) {
  const p = useChartPalette();
  const colorOf = (i: number | undefined) =>
    ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[i ?? 1] ?? p.c1;
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const item = payload[0];
              const pct = ((item.value / total) * 100).toFixed(1);
              return (
                <ChartTooltipCard
                  title={item.name}
                  entries={[
                    { name: "Count", value: item.value as number },
                    { name: "Share", value: `${pct}%` },
                  ]}
                  palette={p}
                />
              );
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="94%"
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            animationDuration={900}
            onMouseEnter={(_, i) => setActiveIndex(i)}
          >
            {data.map((d, i) => (
              <Cell
                key={d.name}
                fill={colorOf(d.colorIndex ?? ((i % 5) + 1))}
                opacity={i === activeIndex ? 1 : 0.55}
                style={{ transition: "opacity 0.2s ease", outline: "none" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
          {centerValue}
        </span>
        <span className="mt-0.5 max-w-[90px] truncate text-[11px] font-medium text-muted-foreground">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Bar chart with gradient highlight on the latest bar ──────────────────── */

let barGradId = 0;

export function AdminBarChart({
  data,
  dataKey = "value",
  xKey = "label",
  height = 240,
  colorIndex = 1,
}: {
  data: Record<string, any>[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
}) {
  const p = useChartPalette();
  const [gradId] = useState(() => `adminBarGrad-${++barGradId}`);
  const color = ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[colorIndex] ?? p.c1;
  const last = data.length - 1;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.c1} />
              <stop offset="100%" stopColor={p.c3} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={p.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            width={48}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip content={makeTooltip(p)} cursor={{ fill: p.grid, opacity: 0.4 }} />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} animationDuration={800}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === last ? `url(#${gradId})` : p.c2} opacity={i === last ? 1 : 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Area chart ───────────────────────────────────────────────────────────── */

let areaGradId = 0;

export function AdminAreaChart({
  data,
  dataKey = "value",
  xKey = "label",
  height = 260,
  colorIndex = 1,
}: {
  data: Record<string, any>[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
}) {
  const p = useChartPalette();
  const [gradId] = useState(() => `adminAreaGrad-${++areaGradId}`);
  const color = ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[colorIndex] ?? p.c1;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={p.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: p.axis, fontSize: 11 }}
            width={48}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip content={makeTooltip(p)} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Mini sparkline for stat cards ────────────────────────────────────────── */

let sparkGradId = 0;

export function AdminSparkline({
  data,
  colorIndex = 1,
  height = 40,
}: {
  data: number[];
  colorIndex?: 1 | 2 | 3 | 4 | 5;
  height?: number;
}) {
  const p = useChartPalette();
  const [gradId] = useState(() => `adminSparkGrad-${++sparkGradId}`);
  const color = ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[colorIndex] ?? p.c1;
  const chartData = data.map((v, i) => ({ i, v }));

  if (data.length < 2) return null;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            animationDuration={1000}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Horizontal progress row (Top-automation style) ───────────────────────── */

export function AdminProgressRow({
  label,
  value,
  display,
  meta,
  delay = 0,
  colorIndex = 1,
}: {
  label: string;
  value: number;
  display: string;
  meta?: string;
  delay?: number;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
}) {
  const p = useChartPalette();
  const color = ({ 1: p.c1, 2: p.c2, 3: p.c3, 4: p.c4, 5: p.c5 })[colorIndex] ?? p.c1;
  const pct = Math.max(2, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[13px] font-semibold text-foreground">{label}</p>
        <span className="font-display text-base font-extrabold text-foreground tabular-nums">{display}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${p.c3}, ${color})` }}
        />
      </div>
      {meta && <p className="mt-1.5 text-[11px] text-muted-foreground">{meta}</p>}
    </div>
  );
}
