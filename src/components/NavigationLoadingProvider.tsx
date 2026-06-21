"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SynapseFitLogo from "./SynapseFitLogo";

export default function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Skip loading on initial mount and for the root page
    if (previousPathname === null) {
      setPreviousPathname(pathname);
      return;
    }

    // Show loading when pathname changes
    if (pathname !== previousPathname) {
      setIsLoading(true);
      setPreviousPathname(pathname);

      // Hide loading after content has loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [pathname, previousPathname]);

  return (
    <>
      {children}
      
      {/* Navigation Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 10, 10, 0.95)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            animation: "fadeIn 0.2s ease-out",
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
              size={180}
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

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
