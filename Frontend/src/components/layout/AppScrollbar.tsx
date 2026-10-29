import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";

type ScrollMetrics = {
  scrollable: boolean;
  trackHeight: number;
  thumbHeight: number;
  thumbOffset: number;
  percent: number;
};

// clientHeight (not innerHeight) so the mobile URL bar showing/hiding while
// scrolling doesn't resize the thumb or shift the scroll range.
const viewportHeight = () => document.documentElement.clientHeight || window.innerHeight;
const pageHeight = () => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0);
const maxScrollTop = () => Math.max(0, pageHeight() - viewportHeight());

const initialMetrics: ScrollMetrics = {
  scrollable: false,
  trackHeight: 0,
  thumbHeight: 0,
  thumbOffset: 0,
  percent: 0,
};

export function AppScrollbar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScrollY: number } | null>(null);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("app-scrollbar-active");
    setIsScrolling(false);
    let frame = 0;
    let idleTimer: number | undefined;

    const measure = () => {
      if (frame) return; // coalesce: at most one measurement per frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        const scrollHeight = pageHeight();
        const vh = viewportHeight();
        const maxScroll = Math.max(0, scrollHeight - vh);
        const trackHeight = trackRef.current?.clientHeight ?? Math.max(0, vh - 72);
        const scrollable = maxScroll > 8 && trackHeight > 0;
        const thumbHeight = scrollable
          ? Math.min(trackHeight, Math.max(34, (trackHeight * vh) / scrollHeight))
          : trackHeight;
        const travel = Math.max(0, trackHeight - thumbHeight);
        const percent = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
        const next = {
          scrollable,
          trackHeight,
          thumbHeight,
          thumbOffset: travel * percent,
          percent: Math.round(percent * 100),
        };
        // Thumb position goes straight to the DOM (no React render per scroll
        // frame); React state only changes when the geometry itself changes.
        if (thumbRef.current) {
          thumbRef.current.style.transform = `translate3d(0, ${next.thumbOffset}px, 0)`;
        }
        trackRef.current?.setAttribute("aria-valuenow", String(next.percent));
        setMetrics((previous) =>
          previous.scrollable === next.scrollable &&
          previous.trackHeight === next.trackHeight &&
          Math.abs(previous.thumbHeight - next.thumbHeight) < 1
            ? previous
            : next,
        );
      });
    };

    const onScroll = () => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setIsScrolling(true); // no-op re-render when already true
        if (idleTimer !== undefined) window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => setIsScrolling(false), 850);
      }
      measure();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure)
      : null;
    resizeObserver?.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      resizeObserver?.disconnect();
      document.documentElement.classList.remove("app-scrollbar-active");
    };
  }, [pathname]);

  const scrollFromPointer = (clientY: number, startY: number, startScrollY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = maxScrollTop();
    const travel = Math.max(1, track.clientHeight - metrics.thumbHeight);
    const nextScroll = startScrollY + ((clientY - startY) / travel) * maxScroll;
    window.scrollTo({ top: Math.max(0, Math.min(maxScroll, nextScroll)), behavior: "auto" });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!metrics.scrollable) return;
    event.preventDefault();
    const track = event.currentTarget;
    const bounds = track.getBoundingClientRect();
    const isThumb = (event.target as HTMLElement).classList.contains("app-scrollbar-thumb");
    const startY = event.clientY;
    const startScrollY = window.scrollY;
    if (!isThumb) {
      const relativeY = Math.max(0, Math.min(track.clientHeight, startY - bounds.top));
      const travel = Math.max(1, track.clientHeight - metrics.thumbHeight);
      const destinationOffset = Math.max(0, Math.min(travel, relativeY - metrics.thumbHeight / 2));
      const maxScroll = maxScrollTop();
      window.scrollTo({ top: (destinationOffset / travel) * maxScroll, behavior: "auto" });
      dragRef.current = { startY, startScrollY: window.scrollY };
    } else {
      dragRef.current = { startY, startScrollY };
    }
    track.setPointerCapture(event.pointerId);
    setIsScrolling(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    scrollFromPointer(event.clientY, dragRef.current.startY, dragRef.current.startScrollY);
  };

  const stopDragging = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const maxScroll = maxScrollTop();
    let top: number | undefined;
    switch (event.key) {
      case "ArrowDown": top = window.scrollY + 48; break;
      case "ArrowUp": top = window.scrollY - 48; break;
      case "PageDown": top = window.scrollY + viewportHeight() * 0.9; break;
      case "PageUp": top = window.scrollY - viewportHeight() * 0.9; break;
      case "Home": top = 0; break;
      case "End": top = maxScroll; break;
      default: return;
    }
    event.preventDefault();
    window.scrollTo({ top: Math.max(0, Math.min(maxScroll, top)), behavior: "auto" });
    setIsScrolling(true);
  };

  if (pathname === "/reels") return null;

  return (
    <div
      ref={trackRef}
      className={`app-scrollbar-track${isScrolling ? " is-scrolling" : ""}${!metrics.scrollable ? " is-empty" : ""}`}
      role="scrollbar"
      aria-label="Page scroll position"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={metrics.percent}
      tabIndex={metrics.scrollable ? 0 : -1}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div
        ref={thumbRef}
        className="app-scrollbar-thumb"
        style={{ height: `${metrics.thumbHeight}px` }}
      />
    </div>
  );
}
