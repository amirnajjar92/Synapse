'use client';

import { useEffect, useState } from 'react';

interface AnimatedLogoProps {
  size?: number;
  onAnimationComplete?: () => void;
}

const LINE_PATH = 'M79.1641 129.338C118.023 132.495 183.508 129.72 251.087 110.632M425.483 6.53156L444.036 -9.14585M425.483 6.53156L430.43 -18.291M425.483 6.53156C378.731 60.9529 314.001 92.8613 251.087 110.632M210.27 344.903C210.27 245.612 231.297 123.886 251.087 110.632';

const HORN_PATH = 'M0 284.8C48.6496 288.719 148.422 294.729 158.317 287.412C170.686 278.267 171.923 250.832 176.87 258.67C181.817 266.509 179.344 322.689 176.87 321.382C174.396 320.076 165.738 296.56 154.607 295.253C145.701 294.208 49.0618 288.72 0 284.8Z';

export default function AnimatedLogo({ size = 180, onAnimationComplete }: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 1500);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 405 405"
      className="text-white overflow-visible"
      role="img"
      aria-label="Synapse Fit"
    >
      {/* Glow effect */}
      <path
        d={LINE_PATH}
        stroke="currentColor"
        strokeOpacity={0.18}
        strokeWidth={11}
        fill="none"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: mounted ? 0 : 1,
          transition: 'stroke-dashoffset 0.95s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />
      
      {/* Main line */}
      <path
        d={LINE_PATH}
        stroke="currentColor"
        strokeWidth={7.84}
        fill="none"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: mounted ? 0 : 1,
          transition: 'stroke-dashoffset 0.95s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      />
      
      {/* Horn */}
      <path
        d={HORN_PATH}
        stroke="currentColor"
        strokeWidth={10.45}
        fill="none"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: mounted ? 0 : 1,
          transition: 'stroke-dashoffset 0.85s cubic-bezier(0.65, 0, 0.35, 1) 0.25s',
        }}
      />
    </svg>
  );
}
