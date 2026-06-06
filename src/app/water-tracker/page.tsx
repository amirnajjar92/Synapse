'use client';

import { useEffect, useState } from 'react';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

export default function WaterTrackerPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      {/* Responsive iPhone Frame */}
      <div 
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        {/* Main Container */}
        <div 
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: '#2C2C2C' }}
        >
          {/* Row 1: 400x144 */}
          <div className="w-full h-[16.48%] border border-[#3B3B3B] flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-40 sm:w-48 md:w-56 h-10 sm:h-12 md:h-14" />
            ) : null}
          </div>

          {/* Row 2: 200x84 (2 columns) */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-24 sm:w-32 md:w-40 h-6 sm:h-8 md:h-10" />
              ) : null}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-24 sm:w-32 md:w-40 h-6 sm:h-8 md:h-10" />
              ) : null}
            </div>
          </div>

          {/* Row 3: 400x461 */}
          <div className="w-full h-[52.75%] border border-[#3B3B3B] flex items-center justify-center">
            {/* Centered container: 146 × 350 */}
            <div 
              className="relative flex items-center justify-center"
              style={{
                width: '36.5%', // 146/400
                height: '75.92%', // 350/461
              }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <img
                  src="/vectors/water-bottle.svg"
                  alt="Water Bottle"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Row 4: 400x176 */}
          <div className="w-full h-[20.14%] border border-[#3B3B3B] flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-20 sm:w-28 md:w-32 h-10 sm:h-14 md:h-16" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}