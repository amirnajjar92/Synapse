"use client";

import SynapseFitLogo from "@/components/SynapseFitLogo";

export default function Loading() {
  return (
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

      {/* Logo with infinite loading animation */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <SynapseFitLogo
          size={220}
          loading={true}
          ink="rgba(255, 255, 255, 0.95)"
          accentInk="#FFFFFF"
        />
      </div>

      {/* Loading text */}
      <div
        style={{
          marginTop: 48,
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
          Loading...
        </p>
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

        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
