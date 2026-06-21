"use client";

import SynapseFitLogo from "@/components/SynapseFitLogo";

export default function PlanListLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
      }}
    >
      <SynapseFitLogo
        size={180}
        animated={false}
        loading={true}
        ink="rgba(255, 255, 255, 0.95)"
        accentInk="#FFFFFF"
      />
    </div>
  );
}
