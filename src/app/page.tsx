"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SynapseFitLogo from "@/components/SynapseFitLogo";
import DailyPlanNotifier from "@/components/DailyPlanNotifier";

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "complete">("loading");

  useEffect(() => {
    // Show loading animation for 2.5 seconds, then navigate
    const timer = setTimeout(() => {
      setPhase("complete");
      router.push("/planner");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <DailyPlanNotifier />
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          zIndex: 9999,
          opacity: phase === "complete" ? 0 : 1,
          transition: "opacity 0.5s ease-out",
        }}
      >
      {/* Ambient glow effect */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 51, 102, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />

      {/* Logo with animation */}
      <div
        style={{
          transform: phase === "loading" ? "scale(1)" : "scale(1.05)",
          transition: "transform 0.5s ease-out",
        }}
      >
        <SynapseFitLogo
          size={280}
          loading={true}
          accentInk="#FFFFFF"
        />
      </div>

      {/* Loading text */}
      <div
        style={{
          marginTop: 48,
          opacity: phase === "loading" ? 1 : 0,
          transform: phase === "loading" ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 18,
            fontWeight: "500",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: 0,
            animation: "fadeInOut 2s ease-in-out infinite",
          }}
        >
          {/* Loading... */}
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 2,
          background: "rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #fc0d0dff, #FF6699)",
            width: "100%",
            transformOrigin: "left",
            animation: "progressBar 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes progressBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}