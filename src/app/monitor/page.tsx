'use client';

import { BarChart } from '@/components/BarChart';
import { useEffect, useState } from 'react';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

export default function MonitorPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Generate sample data for bar charts
  const redChartData = Array.from({ length: 45 }, () => Math.random() * 80 + 20);
  const blueChartData = Array.from({ length: 45 }, (_, i) => {
    // Natural weight loss pattern: slow start, more loss later
    const progress = i / 44; // 0 to 1
    const base = 20 + (progress * 70); // Start at 20, go up to 90
    // Add some natural variation
    const variation = (Math.random() - 0.5) * 20;
    return Math.max(15, Math.min(100, base + variation));
  });

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
  const aspectRatio = baseWidth / baseHeight;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      {/* Responsive iPhone Frame - scales with viewport, maintains aspect ratio */}
      <div 
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: aspectRatio,
          maxHeight: '95vh'
        }}
      >
        {/* Main Container - scales proportionally */}
        <div 
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: '#2C2C2C' }}
        >
          {/* Row 1: 400x153 (17.51% height) - 2 columns matching below */}
          <div className="flex w-full h-[17.51%]">
            {/* Column 1 - left cell */}
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-20 sm:w-28 md:w-32 h-6 sm:h-8 md:h-10" />
              ) : (
                <span className="text-white text-2xl sm:text-3xl md:text-4xl font-light">2026/05</span>
              )}
            </div>
            {/* Column 2 - right cell */}
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-20 sm:w-24 md:w-28 h-8 sm:h-10 md:h-12" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light">DONE</span>
              )}
            </div>
          </div>

          {/* Row 2: 200x84 (9.61% height) */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-16 sm:w-20 md:w-28 h-5 sm:h-6 md:h-8" />
              ) : (
                <span className="text-white text-xl sm:text-2xl md:text-3xl font-light">ACTIVITY</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-24 sm:w-32 md:w-40 h-8 sm:h-10 md:h-12" />
              ) : (
                <span 
                  className="text-white font-bold text-center" 
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', 
                    lineHeight: '1' 
                  }}
                >
                  DAY 24
                </span>
              )}
            </div>
          </div>

          {/* Row 3: 200x50 (5.72% height) */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-12 sm:w-16 md:w-20 h-3 sm:h-4 md:h-5" />
              ) : (
                <span className="text-white text-base sm:text-lg md:text-xl font-light" style={{ lineHeight: '1' }}>Distance</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-16 sm:w-20 md:w-24 h-4 sm:h-5 md:h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-light" style={{ lineHeight: '1' }}>6.34</span>
                  <span className="text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2" style={{ lineHeight: '1' }}>/km</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: 200x50 (5.72% height) */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-10 sm:w-14 md:w-16 h-3 sm:h-4 md:h-5" />
              ) : (
                <span className="text-white text-base sm:text-lg md:text-xl font-light" style={{ lineHeight: '1' }}>Pace</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-16 sm:w-20 md:w-28 h-4 sm:h-5 md:h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-light" style={{ lineHeight: '1' }}>08'07"</span>
                  <span className="text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2" style={{ lineHeight: '1' }}>/km</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: 200x50 (5.72% height) */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-16 sm:w-20 md:w-28 h-3 sm:h-4 md:h-5" />
              ) : (
                <span className="text-white text-base sm:text-lg md:text-xl font-light" style={{ lineHeight: '1' }}>Total Time</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-[6px] sm:px-[12px] md:px-6">
              {isLoading ? (
                <Skeleton className="w-20 sm:w-24 md:w-32 h-4 sm:h-5 md:h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-light" style={{ lineHeight: '1' }}>1:05'37"</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 6: 200x113 (12.93% height) */}
          <div className="flex w-full h-[12.93%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex flex-col p-1 sm:p-1.5 md:p-2">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                  <>
                    <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                      <span>Day1</span>
                      <span>45</span>
                    </div>
                    <div className="flex-1">
                      <BarChart data={redChartData} color="#E63416" />
                    </div>
                  </>
                )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex flex-col p-1 sm:p-1.5 md:p-2 relative">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                  <>
                    <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                      <span>Day1</span>
                      <span>Day45</span>
                    </div>
                    <div className="flex-1 relative">
                      <BarChart 
                        data={blueChartData} 
                        color="#3B63CF" 
                        reversed 
                        showConnectingLine
                        connectingLineColor="#ffffff"
                        connectingLineWidth={1}
                        connectingLineShadow="#EFE9E9"
                        activeBarCount={25}
                        inactiveColor="#666666"
                        showCurrentDayArrow
                        currentDayArrowColor="#ffffff"
                      />
                      <div className="absolute bottom-0.5 sm:bottom-1 left-1 sm:left-2">
                        <span className="text-white text-base sm:text-xl md:text-2xl font-light">-17kg</span>
                      </div>
                      <div className="absolute bottom-0.5 sm:bottom-1 right-1 sm:right-2 text-[10px] sm:text-xs text-gray-400">1kg</div>
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Row 7: 114x156 (17.85% height) & 288x156 */}
          <div className="flex w-full h-[17.85%]">
            <div className="w-[28.36%] h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-10 sm:w-14 md:w-16 h-6 sm:h-8 md:h-10" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light">SUN</span>
              )}
            </div>
            <div className="w-[71.64%] h-full border border-[#3B3B3B] flex items-center justify-center gap-1 sm:gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="w-24 sm:w-32 md:w-40 h-12 sm:h-16 md:h-20" />
                  <Skeleton className="w-8 sm:w-10 md:w-12 h-6 sm:h-8 md:h-10" />
                </>
              ) : (
                <>
                  <span className="text-white text-5xl sm:text-6xl md:text-8xl font-light">2:54</span>
                  <span className="text-gray-400 text-xl sm:text-2xl md:text-3xl">PM</span>
                </>
              )}
            </div>
          </div>

          {/* Row 8: 400x46 (5.26% height) */}
          <div className="w-full h-[5.26%] border border-[#3B3B3B]"></div>

          {/* Row 9: 400x176 (20.14% height) */}
          <div className="w-full h-[20.14%] border border-[#3B3B3B] flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-20 sm:w-28 md:w-32 h-10 sm:h-14 md:h-16" />
            ) : (
              <svg 
                width="80" 
                height="40" 
                viewBox="0 0 120 60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-auto h-auto max-w-[60%] max-h-[60%]"
              >
                <path d="M20 30L100 30M70 10L100 30L70 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
