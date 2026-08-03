/**
 * ScrollSequence — KC standard scroll-scrubbed image sequence (Apple-style hero).
 *
 * Technique: numbered WebP frames drawn to <canvas>, frame index driven by the
 * section's scroll progress via Motion's useScroll (ScrollTimeline-accelerated
 * where the browser supports it). No scroll hijacking — the section is a tall
 * block with a sticky viewport; scroll speed always belongs to the visitor.
 *
 * This page is prerendered, so the canvas cannot paint until React hydrates.
 * The `poster` renders as a plain <picture> behind the canvas and is part of
 * the static HTML — the section is never blank, and the canvas simply covers
 * it once the first frame draws. Under prefers-reduced-motion nothing loads
 * or scrubs; the poster IS the hero image.
 *
 * `children` may be a render function receiving the section's scroll progress
 * (a MotionValue), so overlay copy can stage itself against the scrub without
 * a second scroll listener.
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

interface ScrollSequenceProps {
  /** Returns the URL for frame i (1-indexed). */
  framePath: (index: number) => string;
  frameCount: number;
  /** Optional smaller frame set served to narrow viewports. */
  framePathSm?: (index: number) => string;
  frameCountSm?: number;
  /** Media query that selects the small set (and poster). */
  mobileMedia?: string;
  /** Static image painted behind the canvas; shipped in the prerendered HTML. */
  poster?: string;
  posterSm?: string;
  /** Total scroll distance of the section, in vh. ~300–500 feels right. */
  scrollLengthVh?: number;
  /** Frames to load before enabling the scrub (rest stream in background). */
  eagerFrames?: number;
  id?: string;
  /** Overlay content, or a render function of the section's scroll progress. */
  children?: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  className?: string;
}

export default function ScrollSequence({
  framePath,
  frameCount,
  framePathSm,
  frameCountSm,
  mobileMedia = "(max-width: 768px)",
  poster,
  posterSm,
  scrollLengthVh = 400,
  eagerFrames = 10,
  id,
  children,
  className,
}: ScrollSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  // Which set this client is scrubbing — decided once on mount, never on
  // resize (swapping sets mid-scrub restarts the preload for no visual gain).
  const activeCountRef = useRef(frameCount);
  const lastDrawnRef = useRef(-1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /** Draw a frame, cover-fitted, DPR-aware (capped at 2). */
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    if (index === lastDrawnRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = canvas;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // cover-fit
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    lastDrawnRef.current = index;
  };

  // Preload: first frame immediately, eager batch, then stream the rest.
  // Skipped entirely under reduced motion — the poster carries the section.
  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;

    const useSmall =
      framePathSm !== undefined &&
      frameCountSm !== undefined &&
      window.matchMedia(mobileMedia).matches;
    const path = useSmall ? framePathSm : framePath;
    const count = useSmall ? frameCountSm : frameCount;
    activeCountRef.current = count;
    framesRef.current = new Array(count).fill(null);

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = async () => {
          try {
            await img.decode(); // decode ahead of first scrub
          } catch {
            /* decode() can reject on some browsers; the frame still draws */
          }
          if (!cancelled) framesRef.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = path(i + 1); // files are 1-indexed
      });

    const preload = async () => {
      await load(0);
      if (cancelled) return;
      draw(0);
      await Promise.all(
        Array.from({ length: Math.min(eagerFrames, count) - 1 }, (_, k) =>
          load(k + 1),
        ),
      );
      if (cancelled) return;
      setReady(true);
      // Stream remaining frames without blocking anything.
      for (let i = eagerFrames; i < count; i++) void load(i);
    };

    // Hold the whole preload until the browser is idle after `load`: the
    // poster covers the section visually, and frames requested any earlier
    // compete with fonts and the headline inside the LCP window.
    const whenIdle = () => {
      const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (idle) idle(() => void preload(), { timeout: 1500 });
      else window.setTimeout(() => void preload(), 200);
    };
    if (document.readyState === "complete") {
      whenIdle();
    } else {
      window.addEventListener("load", whenIdle, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", whenIdle);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, frameCountSm, reducedMotion]);

  // Scroll → frame index, batched through rAF.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!ready || reducedMotion) return;
    const count = activeCountRef.current;
    const index = Math.min(
      count - 1,
      Math.max(0, Math.floor(progress * count)),
    );
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => draw(index));
  });

  // Redraw current frame on resize.
  useEffect(() => {
    const onResize = () => {
      const current = Math.max(0, lastDrawnRef.current);
      lastDrawnRef.current = -1;
      draw(current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      // The reduced-motion height override lives in CSS (.scroll-sequence),
      // NOT here: this style is prerendered, and React never reconciles a
      // mismatched attribute during hydration — a JS-side ternary would
      // leave reduced-motion visitors stuck with the server's tall value.
      className={`scroll-sequence ${className ?? ""}`}
      style={{ height: `${scrollLengthVh}vh`, position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {poster && (
          <picture aria-hidden="true">
            {posterSm && <source media={mobileMedia} srcSet={posterSm} />}
            <img
              src={poster}
              alt=""
              // Deliberately low: the LCP element is the overlay headline,
              // and the poster must not outrank the fonts it paints with.
              fetchPriority="low"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </picture>
        )}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
        {children && (
          <div style={{ position: "absolute", inset: 0 }}>
            {typeof children === "function" ? children(scrollYProgress) : children}
          </div>
        )}
      </div>
    </section>
  );
}
