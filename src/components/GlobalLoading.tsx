"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SynapseFitLogo from "./SynapseFitLogo";

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading when pathname changes
    setIsLoading(true);
    
    // Hide loading after a short delay to allow page to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 10, 0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        opacity: isLoading ? 1 : 0,
        transition: "opacity 0.3s ease-out",
        pointerEvents: isLoading ? "all" : "none",
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
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />

      {/* Logo with loading animation */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <SynapseFitLogo
          size={200}
          loading={true}
          ink="rgba(255, 255, 255, 0.95)"
          accentInk="#FFFFFF"
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
