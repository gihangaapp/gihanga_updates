import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";

type ScrollMetrics = {
  scrollable: boolean;
  trackHeight: number;
  thumbHeight: number;
  thumbOffset: number;
  percent: number;
};

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
  const dragRef = useRef<{ startY: number; startScrollY: number } | null>(null);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("app-scrollbar-active");
    setIsScrolling(false);
    let frame = 0;
    let idleTimer: number | undefined;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollHeight = Math.max(doc.scrollHeight, document.body?.scrollHeight ?? 0);
        const viewportHeight = window.innerHeight;
        const maxScroll = Math.max(0, scrollHeight - viewportHeight);
        const trackHeight = trackRef.current?.clientHeight ?? Math.max(0, viewportHeight - 72);
        const scrollable = maxScroll > 8 && trackHeight > 0;
        const thumbHeight = scrollable
          ? Math.min(trackHeight, Math.max(34, (trackHeight * viewportHeight) / scrollHeight))
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
        setMetrics((previous) =>
          previous.scrollable === next.scrollable &&
          previous.trackHeight === next.trackHeight &&
          Math.abs(previous.thumbHeight - next.thumbHeight) < 1 &&
          Math.abs(previous.thumbOffset - next.thumbOffset) < 1 &&
          previous.percent === next.percent
            ? previous
            : next,
        );
      });
    };

    const onScroll = () => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setIsScrolling(true);
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
    resizeObserver?.observe(document.documentElement);
    resizeObserver?.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
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
    const maxScroll = Math.max(
      0,
      Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0) -
        window.innerHeight,
    );
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
      const maxScroll = Math.max(
        0,
        Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0) -
          window.innerHeight,
      );
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
    const maxScroll = Math.max(
      0,
      Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0) -
        window.innerHeight,
    );
    let top: number | undefined;
    switch (event.key) {
      case "ArrowDown": top = window.scrollY + 48; break;
      case "ArrowUp": top = window.scrollY - 48; break;
      case "PageDown": top = window.scrollY + window.innerHeight * 0.9; break;
      case "PageUp": top = window.scrollY - window.innerHeight * 0.9; break;
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
      onLostPointerCapture={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div
        className="app-scrollbar-thumb"
        style={{ height: `${metrics.thumbHeight}px`, transform: `translateY(${metrics.thumbOffset}px)` }}
      />
    </div>
  );
}
