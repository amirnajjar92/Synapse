'use client';

import { useEffect, useState } from 'react';

export default function TestLogo() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after a brief delay
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width="200"
        height="200"
        viewBox="0 0 405 405"
        className="text-white"
      >
        <path
          d="M79.1641 129.338C118.023 132.495 183.508 129.72 251.087 110.632M425.483 6.53156L444.036 -9.14585M425.483 6.53156L430.43 -18.291M425.483 6.53156C378.731 60.9529 314.001 92.8613 251.087 110.632M210.27 344.903C210.27 245.612 231.297 123.886 251.087 110.632"
          stroke="currentColor"
          strokeWidth="7.84"
          fill="none"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: animate ? 0 : 1,
            transition: 'stroke-dashoffset 2s ease-in-out',
          }}
        />
      </svg>
      <p className="text-white">Animation state: {animate ? 'ON' : 'OFF'}</p>
    </div>
  );
}
