"use client";

import { useEffect, useRef, useState } from "react";

interface LogoAnimationProps {
  onComplete?: () => void;
}

export default function LogoAnimation({ onComplete }: LogoAnimationProps) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const [phase, setPhase] = useState<"draw" | "hold" | "fade" | "done">("draw");

  useEffect(() => {
    const p1 = path1Ref.current;
    const p2 = path2Ref.current;
    if (!p1 || !p2) return;

    const len1 = p1.getTotalLength();
    const len2 = p2.getTotalLength();

    // Set up initial state — fully hidden via dash trick
    p1.style.strokeDasharray = `${len1}`;
    p1.style.strokeDashoffset = `${len1}`;
    p2.style.strokeDasharray = `${len2}`;
    p2.style.strokeDashoffset = `${len2}`;

    // Force reflow
    p1.getBoundingClientRect();

    // Trigger CSS transitions for drawing
    requestAnimationFrame(() => {
      p1.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)`;
      p1.style.strokeDashoffset = "0";

      // Path 2 starts slightly delayed for a sequential feel
      setTimeout(() => {
        p2.style.transition = `stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)`;
        p2.style.strokeDashoffset = "0";
      }, 600);
    });

    // After draw completes (2s), hold briefly then fade
    const holdTimer = setTimeout(() => setPhase("hold"), 2200);
    const fadeTimer = setTimeout(() => setPhase("fade"), 2800);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, 3600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      aria-label="App loading"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        zIndex: 9999,
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? "opacity 0.8s ease-in-out" : "none",
      }}
    >
      {/* Subtle ambient ring behind the logo */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* SVG Logo */}
      <svg
        width="260"
        height="260"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: "visible",
          filter:
            phase === "hold" || phase === "fade"
              ? "drop-shadow(0 0 18px rgba(255,255,255,0.12))"
              : "none",
          transition: "filter 0.5s ease",
        }}
      >
        {/* Path 1 — long synapse connection */}
        <path
          ref={path1Ref}
          d="M106.93 199.412C159.419 203.677 247.873 199.927 339.156 174.144M574.724 33.5294L599.785 12.3529M574.724 33.5294L581.407 0M574.724 33.5294C511.574 107.04 424.139 150.14 339.156 174.144M284.023 490.588C284.023 356.471 312.425 192.047 339.156 174.144"
          stroke="white"
          strokeWidth="10.5882"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Path 2 — synapse node / bulb */}
        <path
          ref={path2Ref}
          d="M0 409.41C65.714 414.704 200.483 422.821 213.849 412.939C230.556 400.586 232.227 363.527 238.909 374.115C245.592 384.704 242.251 460.589 238.909 458.824C235.568 457.059 223.873 425.295 208.837 423.53C196.808 422.118 66.2709 414.705 0 409.41Z"
          stroke="white"
          strokeWidth="14.1176"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* App name — fades in after draw completes */}
      <div
        style={{
          marginTop: 40,
          opacity: phase === "draw" ? 0 : 1,
          transform: phase === "draw" ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            margin: 0,
            fontFamily:
              "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          }}
        >
          Synapse
        </p>
      </div>

      {/* Thin progress line at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 1,
          background: "rgba(255,255,255,0.15)",
          width: phase === "draw" ? "100%" : "100%",
          transformOrigin: "left",
          transform: `scaleX(${phase === "draw" ? 1 : 1})`,
        }}
      >
        <div
          style={{
            height: "100%",
            background: "rgba(255,255,255,0.5)",
            width: "100%",
            transformOrigin: "left",
            transform: phase === "draw" ? "scaleX(0)" : "scaleX(1)",
            transition:
              phase === "draw" ? "transform 2s cubic-bezier(0.4,0,0.2,1)" : "none",
            animation: phase === "draw" ? "progressFill 2s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
          }}
        />
      </div>

      <style>{`
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
