"use client";

import SynapseFitLogo from "./SynapseFitLogo";

interface LoadingSpinnerProps {
  /** Size of the logo in pixels. Default 120. */
  size?: number;
  /** Show centered in container. Default true. */
  centered?: boolean;
  /** Optional text below the logo. */
  text?: string;
  /** Full screen overlay mode. Default false. */
  fullscreen?: boolean;
}

export default function LoadingSpinner({
  size = 120,
  centered = true,
  text,
  fullscreen = false,
}: LoadingSpinnerProps) {
  const containerStyle: React.CSSProperties = fullscreen
    ? {
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 10, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 9999,
      }
    : centered
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }
    : {
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      };

  return (
    <div style={containerStyle}>
      {fullscreen && (
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <SynapseFitLogo
          size={size}
          animated={false}
          loading={true}
          ink="rgba(255, 255, 255, 0.95)"
          accentInk="#FFFFFF"
        />
      </div>

      {text && (
        <p
          style={{
            marginTop: "1.5rem",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.95rem",
            fontWeight: "500",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          {text}
        </p>
      )}

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
