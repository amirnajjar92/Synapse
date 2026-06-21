'use client';

import { useEffect, useState } from 'react';

interface AnimatedLogoProps {
  /** Width and Height constraint for the square viewBox aspect ratio. Default 180. */
  size?: number;
  /** Callback triggered after the initial animation sequences complete. */
  onAnimationComplete?: () => void;
  /** Accent color specifically for the sharp dynamic synapses. Default '#FFFFFF' (White). */
  accentInk?: string;
  /** Enable infinite loading animation mode - lines continuously animate in a loop. Default false. */
  loading?: boolean;
}

// Keeping your precise, savage original geometric vectors
const LINE_PATH = 'M79.1641 129.338C118.023 132.495 183.508 129.72 251.087 110.632M425.483 6.53156L444.036 -9.14585M425.483 6.53156L430.43 -18.291M425.483 6.53156C378.731 60.9529 314.001 92.8613 251.087 110.632M210.27 344.903C210.27 245.612 231.297 123.886 251.087 110.632';
const HORN_PATH = 'M0 284.8C48.6496 288.719 148.422 294.729 158.317 287.412C170.686 278.267 171.923 250.832 176.87 258.67C181.817 266.509 179.344 322.689 176.87 321.382C174.396 320.076 165.738 296.56 154.607 295.253C145.701 294.208 49.0618 288.72 0 284.8Z';

export default function AnimatedLogo({ 
  size = 180, 
  onAnimationComplete,
  accentInk = '#FFFFFF',
  loading = false
}: AnimatedLogoProps) {
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
    <div 
      className="synapse-fit-brand-wrapper"
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-block', 
        position: 'relative' 
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 450 405"
        className="text-white overflow-visible"
        role="img"
        aria-label="Synapse Fit"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* High-end blur filter for your glow paths */}
          <filter id="synapse-premium-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* BACKGROUND LAYER: NEURAL SYNAPSE NETWORK */}
        <g className={`synapse-mesh-network ${mounted ? 'active' : ''}`}>
          {/* Subtle neural connection tracks mapped behind your native paths */}
          <path d="M79 129 L158 287 M251 110 L176 258" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" strokeDasharray="3 3" />
          <path d="M0 284 L210 344 L251 110" stroke={accentInk} strokeWidth="1.2" strokeOpacity="0.15" />
          
          {/* Pulsing Synapse Intersections */}
          <circle cx="251" cy="110" r="4.5" fill={accentInk} filter="url(#synapse-premium-glow)" className="pulse-node" />
          <circle cx="158" cy="287" r="3" fill="currentColor" opacity="0.4" />
          <circle cx="79" cy="129" r="3.5" fill={accentInk} className="pulse-node" />
        </g>

        {/* CORE LAYER: YOUR ORIGINAL SAVAGE VECTORS */}
        {/* Glow Path base */}
        <path
          d={LINE_PATH}
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={11}
          fill="none"
          className={loading ? 'loading-line-glow' : ''}
          style={{
            strokeDasharray: mounted ? '1000' : '0',
            strokeDashoffset: loading ? 1000 : 0,
            transition: loading ? 'none' : 'all 0.95s cubic-bezier(0.65, 0, 0.35, 1)',
            animation: loading ? 'infiniteLineDraw 2.5s linear infinite' : 'none',
          }}
        />
        
        {/* Main sharp line */}
        <path
          d={LINE_PATH}
          stroke="currentColor"
          strokeWidth={7.84}
          fill="none"
          className={loading ? 'loading-line' : ''}
          style={{
            strokeDasharray: mounted ? '1000' : '0',
            strokeDashoffset: loading ? 1000 : 0,
            transition: loading ? 'none' : 'all 0.95s cubic-bezier(0.65, 0, 0.35, 1)',
            animation: loading ? 'infiniteLineDraw 2.5s linear infinite' : 'none',
          }}
        />
        
        {/* Savage Horn vector */}
        <path
          d={HORN_PATH}
          stroke="currentColor"
          strokeWidth={10.45}
          fill="none"
          className={loading ? 'loading-horn' : ''}
          style={{
            strokeDasharray: mounted ? '1000' : '0',
            strokeDashoffset: loading ? 1000 : 0,
            transition: loading ? 'none' : 'all 0.85s cubic-bezier(0.65, 0, 0.35, 1) 0.25s',
            animation: loading ? 'infiniteLineDraw 2.5s linear infinite 0.3s' : 'none',
          }}
        />

        {/* FOREGROUND LAYER: INTEGRATED APP TYPOGRAPHY */}
        <g 
          className="brand-text-group"
          style={{ 
            opacity: mounted ? 1 : 0, 
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s'
          }}
        >
          {/* SYNAPSE - Utilizing your loaded Next.js app font variable - BIGGER & CENTERED */}
          <text
            x="202.5"
            y="225"
            fill="currentColor"
            fontSize="92"
            fontWeight="400"
            letterSpacing="3"
            fontFamily="var(--font-hanalei-fill), system-ui, sans-serif"
            textAnchor="middle"
          >
            Synapse
          </text>

          {/* FIT sub-branding styling - ALIGNED RIGHT */}
          <text
            x="385"
            y="255"
            fill={accentInk}
            fontSize="36"
            fontWeight="800"
            letterSpacing="12"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="end"
          >
            FIT
          </text>
        </g>
      </svg>

      <style jsx>{`
        .synapse-mesh-network {
          opacity: 0;
          transition: opacity 1.2s ease-out 0.2s;
        }
        .synapse-mesh-network.active {
          opacity: 1;
        }
        .pulse-node {
          animation: nodeGlowPulse 2.5s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes nodeGlowPulse {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes infiniteLineDraw {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}