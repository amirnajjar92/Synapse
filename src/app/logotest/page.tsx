"use client";

import { useState } from "react";
import SynapseFitLogo from "@/components/SynapseFitLogo";

export default function LogoTest() {
  const [variant, setVariant] = useState<"full" | "mark" | "wordmark">("full");
  const [size, setSize] = useState(280);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
          : "linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)",
        padding: "2rem",
        transition: "background 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: darkMode ? "rgba(255, 255, 255, 0.95)" : "#0a0a0a",
            fontSize: "3rem",
            fontWeight: "900",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          SYNAPSE FIT LOGO TEST
        </h1>
        <p
          style={{
            color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
            fontSize: "1.2rem",
            marginBottom: "3rem",
          }}
        >
          Test and preview the SynapseFitLogo component with different configurations
        </p>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
            padding: "2rem",
            background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            border: darkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Variant Selection */}
          <div>
            <label
              style={{
                display: "block",
                color: darkMode ? "rgba(255, 255, 255, 0.9)" : "#0a0a0a",
                fontWeight: "600",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Variant
            </label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: darkMode ? "#1a1a1a" : "#ffffff",
                color: darkMode ? "#ffffff" : "#0a0a0a",
                border: darkMode
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(0, 0, 0, 0.2)",
                borderRadius: "6px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              <option value="full">Full (Mark + Wordmark)</option>
              <option value="mark">Mark Only</option>
              <option value="wordmark">Wordmark Only</option>
            </select>
          </div>

          {/* Size Slider */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: darkMode ? "rgba(255, 255, 255, 0.9)" : "#0a0a0a",
                fontWeight: "600",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
              Dark Mode
            </label>
          </div>
        </div>

        {/* Main Display Area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "500px",
            padding: "4rem",
            background: darkMode
              ? "rgba(0, 0, 0, 0.3)"
              : "rgba(255, 255, 255, 0.5)",
            borderRadius: "16px",
            border: darkMode
              ? "2px solid rgba(255, 255, 255, 0.1)"
              : "2px solid rgba(0, 0, 0, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow effect */}
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: darkMode
                ? "radial-gradient(circle, rgba(255, 51, 102, 0.08) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255, 51, 102, 0.15) 0%, transparent 70%)",
              pointerEvents: "none",
              animation: "pulse 3s ease-in-out infinite",
            }}
          />

          {/* Logo Component */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <SynapseFitLogo
              size={size}
              loading={true}
              accentInk="#FFFFFF"
            />
          </div>
        </div>

        {/* Code Example */}
        <div
          style={{
            marginTop: "3rem",
            padding: "2rem",
            background: darkMode ? "#0a0a0a" : "#f5f5f5",
            borderRadius: "12px",
            border: darkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              color: darkMode ? "rgba(255, 255, 255, 0.9)" : "#0a0a0a",
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current Configuration
          </h3>
          <pre
            style={{
              color: darkMode ? "#4ade80" : "#16a34a",
              fontFamily: "monospace",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              overflow: "auto",
              padding: "1rem",
              background: darkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.05)",
              borderRadius: "8px",
            }}
          >
{`<SynapseFitLogo
  size={${size}}
  loading={true}
  accentInk="#FFFFFF"
/>`}
          </pre>
        </div>

        {/* Variant Showcase */}
        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {["full", "mark", "wordmark"].map((v) => (
            <div
              key={v}
              style={{
                padding: "2rem",
                background: darkMode
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.03)",
                borderRadius: "12px",
                border: darkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <h4
                style={{
                  color: darkMode ? "rgba(255, 255, 255, 0.9)" : "#0a0a0a",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {v}
              </h4>
              <SynapseFitLogo
                size={200}
                loading={true}
                accentInk="#FFFFFF"
              />
            </div>
          ))}
        </div>
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
