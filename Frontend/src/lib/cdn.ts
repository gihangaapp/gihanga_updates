/**
 * B1 — Cloudinary delivery-URL transformation helper. Builds real srcset
 * candidates with f_auto,q_auto,c_limit so the feed downloads exactly the
 * pixels it needs. Falls back to undefined for local /uploads media (no CDN
 * transformations there) and the caller uses the plain URL.
 */

const CLOUDINARY_URL_RE =
  /^(https:\/\/res\.cloudinary\.com\/[^/]+)\/(image|video)\/upload\/(?:[^/]+\/)?([^?#]+)$/;

export interface CdnUrlOptions {
  /** Target width in px (c_limit never upscales). */
  width: number;
  /** Extra transformation chain entries, e.g. ["q_auto", "f_auto"]. */
  extra?: string[];
}

/** True when the URL is a Cloudinary delivery URL we can transform. */
export function isCdnUrl(url: string | undefined | null): boolean {
  return Boolean(url && CLOUDINARY_URL_RE.test(url));
}

/**
 * Returns the transformed URL, or undefined when the media isn't on a CDN.
 * Photos: f_auto,q_auto,c_limit,w_<W>. Videos: f_auto,q_auto,vc_auto
 * (via the caller's extras) — c_limit applies to images; for videos the
 * caller passes what it needs.
 */
export function cdnUrl(url: string | undefined | null, options: CdnUrlOptions): string | undefined {
  if (!url) return undefined;
  const m = url.match(CLOUDINARY_URL_RE);
  if (!m) return undefined;
  const [, base, kind, asset] = m;
  const chain = [
    `f_auto`,
    `q_auto`,
    ...(options.extra ?? []),
    `c_limit,w_${Math.round(options.width)}`,
  ];
  return `${base}/${kind}/upload/${chain.join(",")}/${asset}`;
}

/**
 * Builds a full `srcset` attribute value for the given widths, e.g.
 * "…w_480 480w, …w_800 800w, …w_1200 1200w". Returns undefined for
 * non-CDN media (a srcset of identical URLs would be pointless).
 */
export function cdnSrcSet(
  url: string | undefined | null,
  widths: readonly number[],
): string | undefined {
  if (!url || !isCdnUrl(url)) return undefined;
  const entries = widths
    .map((w) => {
      const u = cdnUrl(url, { width: w });
      return u ? `${u} ${w}w` : undefined;
    })
    .filter(Boolean) as string[];
  return entries.length > 1 ? entries.join(", ") : undefined;
}
