/**
 * Achievement Badge System — SVG icon set.
 *
 * Each badge renders as EITHER a filled (earned) or outlined (locked) icon,
 * in its configured milestone color. Colors map to the app's existing theme
 * tokens (danger / warning / info / success) so they automatically adapt to
 * the light and dark themes — no hardcoded hex.
 *
 * Outlined icons use the SAME shape and dimensions as filled ones, just with
 * a transparent interior and a colored stroke, so the locked/unlocked states
 * are visually distinct but dimensionally consistent (per the wireframe and
 * the accessibility spec — never use color alone to signal "earned").
 */

import { cn } from "@/lib/utils";

export type BadgeColor = "red" | "gold" | "blue" | "green";
export type BadgeIcon = "star" | "diamond";

/** Resolves a milestone color to the app's theme token + a readable label. */
export function resolveBadgeColor(color: BadgeColor): {
  /** CSS color value — resolves the theme variable at runtime. */
  value: string;
  /** Human-readable name for screen readers. */
  label: string;
} {
  switch (color) {
    case "red":
      return { value: "var(--danger)", label: "red" };
    case "gold":
      return { value: "var(--warning)", label: "gold" };
    case "blue":
      return { value: "var(--info)", label: "blue" };
    case "green":
      return { value: "var(--success)", label: "green" };
  }
}

interface BadgeIconProps {
  icon: BadgeIcon;
  color: BadgeColor;
  /** When true, the icon is solidly filled (earned). When false, it's an outlined silhouette (locked). */
  filled: boolean;
  size?: number;
  className?: string;
}

export function BadgeIconSvg({ icon, color, filled, size = 36, className }: BadgeIconProps) {
  const { value, label } = resolveBadgeColor(color);
  const stroke = value;
  const fill = filled ? value : "transparent";
  const strokeWidth = filled ? 0 : 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label={`${label} ${icon}${filled ? " — earned" : " — locked"}`}
    >
      {icon === "star" ? (
        <path
          d="M24 3.5l5.62 12.49 13.7 1.42-10.2 9.2 2.87 13.48L24 33.9l-11.99 6.19 2.87-13.48-10.2-9.2 13.7-1.42L24 3.5z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ) : (
        // Diamond — faceted gem silhouette.
        <>
          <path
            d="M24 3.5L44.5 18 24 44.5 3.5 18 24 3.5z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Facet lines — always visible (thin, lower-opacity) so the diamond reads as a gem even when outlined. */}
          <path
            d="M3.5 18h41M24 3.5L13.5 18 24 44.5M24 3.5L34.5 18 24 44.5"
            stroke={stroke}
            strokeWidth={filled ? 1 : 1.2}
            strokeLinejoin="round"
            opacity={filled ? 0.35 : 0.5}
          />
        </>
      )}
    </svg>
  );
}
