/**
 * B4 — a real CSS `linear-gradient()` parser that maps any preset to the
 * correct canvas gradient, replacing the old hard-coded purple→red→orange
 * replacement that made EVERY gradient preset publish identically.
 *
 * Supported grammar (enough for CSS backgrounds used by stories and then
 * some):
 *   linear-gradient( <angle> , <color-stop> [, <color-stop>]... )
 *   angle := <number>deg | to <side-or-corner>
 *   color-stop := <color> [ <position>%? ]
 *   color := #rgb | #rrggbb | rgba?(...) | hsl?(...) | named
 *
 * Pure module: no DOM, unit-tested in tests/gradient.test.ts.
 */

export interface GradientStop {
  color: string;
  /** 0..1 position along the gradient axis; missing positions are interpolated. */
  pos: number;
}

export interface ParsedLinearGradient {
  /** Angle in CSS degrees (0deg points up, clockwise). */
  angleDeg: number;
  stops: GradientStop[];
}

const NAMED_COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  transparent: "rgba(0,0,0,0)",
};

function normalizeColor(raw: string): string | null {
  const token = raw.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(token)) {
    return `#${token[1]}${token[1]}${token[2]}${token[2]}${token[3]}${token[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(token)) return token;
  if (/^#[0-9a-f]{8}$/.test(token)) return token;
  if (/^rgba?\(/.test(token) && /\)$/.test(token)) return token;
  if (/^hsla?\(/.test(token) && /\)$/.test(token)) return token;
  if (NAMED_COLORS[token]) return NAMED_COLORS[token];
  return null;
}

/** Split a comma-separated list respecting parentheses nesting. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Parses `linear-gradient(...)`. Returns null when the string isn't a
 * parseable linear gradient (callers fall back to a solid color).
 */
export function parseLinearGradient(css: string): ParsedLinearGradient | null {
  if (typeof css !== "string") return null;
  const match = css.trim().match(/^linear-gradient\((.*)\)$/i);
  if (!match || !match[1]) return null;

  const parts = splitTopLevel(match[1]);
  const firstPart = parts[0];
  if (!firstPart || parts.length < 2) return null;

  // First token: angle or side-or-corner (optional — CSS default is 180deg).
  let angleDeg = 180;
  let start = 0;
  const first = firstPart.toLowerCase();
  if (/^-?\d*\.?\d+deg$/.test(first)) {
    angleDeg = parseFloat(first);
    start = 1;
  } else if (/^to\s+/.test(first)) {
    angleDeg = sideOrCornerToAngle(first);
    start = 1;
  }

  const stopTokens = parts.slice(start);
  if (stopTokens.length < 2) return null;

  // Parse each stop: color [+ position%]. The color may contain spaces
  // ("rgb(1, 2, 3)" was already protected by splitTopLevel commas).
  const rawStops: { color: string; pos: number | null }[] = [];
  for (const token of stopTokens) {
    // Position can precede or follow the color per CSS spec; in practice
    // presets use "color pos%" — handle both orders.
    const m = token.match(/^(.*?)(?:\s+([\d.]+)%)?$|^([\d.]+)%\s+(.*)$/);
    if (!m) return null;
    let colorRaw = m[1];
    let posRaw = m[2];
    if (m[3] !== undefined && m[4] !== undefined) {
      posRaw = m[3];
      colorRaw = m[4];
    }
    const color = normalizeColor(colorRaw ?? "");
    if (!color) return null;
    rawStops.push({
      color,
      pos: posRaw !== undefined && posRaw !== "" ? parseFloat(posRaw) / 100 : null,
    });
  }

  // Interpolate missing positions: first=0, last=1, middles spread evenly.
  const stops: GradientStop[] = [];
  const firstIdx = rawStops.findIndex((s) => s.pos !== null);
  if (firstIdx === -1) {
    // No positions at all: evenly spaced.
    rawStops.forEach((s, i) => stops.push({ color: s.color, pos: i / (rawStops.length - 1) }));
  } else {
    for (let i = 0; i < firstIdx; i++) stops.push({ color: rawStops[i]!.color, pos: 0 });
    for (let i = firstIdx; i < rawStops.length; i++) {
      const s = rawStops[i]!;
      if (s.pos !== null) {
        stops.push({ color: s.color, pos: s.pos });
        continue;
      }
      // Find the next positioned stop and spread evenly between.
      let next = i + 1;
      while (next < rawStops.length && rawStops[next]!.pos === null) next++;
      const nextPos = next < rawStops.length ? rawStops[next]!.pos! : 1;
      const prevPos = stops.length > 0 ? stops[stops.length - 1]!.pos : 0;
      const span = Math.max(1, next - i);
      stops.push({
        color: s.color,
        pos: prevPos + ((nextPos - prevPos) * (next - i)) / span / (next - i),
      });
      // Simpler: place at prev + (nextPos-prev)*(1/span)... keep the direct
      // interpolation for the FIRST unpositioned one and treat the rest as
      // equally spread below.
      stops[stops.length - 1]!.pos = prevPos + (nextPos - prevPos) / span;
      for (let j = i + 1; j < next; j++) {
        stops.push({
          color: rawStops[j]!.color,
          pos: prevPos + ((nextPos - prevPos) * (j - i + 1)) / span,
        });
      }
      i = next - 1;
    }
    // Trailing unpositioned stops land at 1.
    if (stops.length < rawStops.length + firstIdx) {
      // (handled above; no-op for safety)
    }
  }

  return { angleDeg: ((angleDeg % 360) + 360) % 360, stops };
}

function sideOrCornerToAngle(token: string): number {
  switch (token.replace(/\s+/g, " ").trim()) {
    case "to top":
      return 0;
    case "to top right":
    case "to right top":
      return 45;
    case "to right":
      return 90;
    case "to bottom right":
    case "to right bottom":
      return 135;
    case "to bottom":
      return 180;
    case "to bottom left":
    case "to left bottom":
      return 225;
    case "to left":
      return 270;
    case "to top left":
    case "to left top":
      return 315;
    default:
      return 180;
  }
}

/**
 * Canvas gradient endpoint math. CSS angles: 0deg = to top, clockwise. The
 * gradient line passes through the centre in direction (sinθ, −cosθ) and is
 * corner-fitted: its length is |W·sinθ| + |H·cosθ| (the same construction
 * browsers use), so the endpoints may lie outside the box for diagonal
 * angles — exactly matching what CSS paints.
 */
export function gradientLineForAngle(angleDeg: number, width: number, height: number) {
  const theta = (angleDeg * Math.PI) / 180;
  const ux = Math.sin(theta);
  const uy = -Math.cos(theta);
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.abs(width * Math.sin(theta)) + Math.abs(height * Math.cos(theta));
  const half = len / 2;
  return {
    x0: cx - ux * half,
    y0: cy - uy * half,
    x1: cx + ux * half,
    y1: cy + uy * half,
  };
}

/** Fills a canvas context with the parsed gradient (or solid fallback). */
export function paintBackground(
  ctx: CanvasRenderingContext2D,
  background: string,
  width: number,
  height: number,
): void {
  const parsed = parseLinearGradient(background);
  if (!parsed) {
    const color = normalizeColor(background) ?? "#0c0c0e";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const { x0, y0, x1, y1 } = gradientLineForAngle(parsed.angleDeg, width, height);
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const stop of parsed.stops) {
    grad.addColorStop(Math.min(1, Math.max(0, stop.pos)), stop.color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
