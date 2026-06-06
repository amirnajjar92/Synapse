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

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* iPhone 17 Frame - 402x874 */}
      <div className="w-[402px] h-[874px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative">
        {/* Main Container */}
        <div className="w-full h-full bg-gray-800 flex flex-col">
          
          {/* Row 1: 400x153 */}
          <div className="w-[400px] h-[153px] border border-white flex items-center justify-between px-6">
            {isLoading ? (
              <>
                <Skeleton className="w-32 h-10" />
                <Skeleton className="w-28 h-12" />
              </>
            ) : (
              <>
                <span className="text-white text-4xl font-light">2026/05</span>
                <span className="text-white text-5xl font-light">DONE</span>
              </>
            )}
          </div>

          {/* Row 2: 200x84 */}
          <div className="flex">
            <div className="w-[200px] h-[84px] border border-white flex items-center px-6">
              {isLoading ? (
                <Skeleton className="w-28 h-8" />
              ) : (
                <span className="text-white text-3xl font-light">ACTIVITY</span>
              )}
            </div>
            <div className="w-[200px] h-[84px] border border-white flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-40 h-12" />
              ) : (
                <span className="text-white font-bold text-center" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc(84px * 0.806)', lineHeight: '1' }}>
                  DAY 24
                </span>
              )}
            </div>
          </div>

          {/* Row 3: 200x50 */}
          <div className="flex">
            <div className="w-[200px] h-[50px] border border-white flex items-center px-6">
              {isLoading ? (
                <Skeleton className="w-20 h-5" />
              ) : (
                <span className="text-white text-xl font-light" style={{ lineHeight: '1' }}>Distance</span>
              )}
            </div>
            <div className="w-[200px] h-[50px] border border-white flex items-center justify-center px-6">
              {isLoading ? (
                <Skeleton className="w-24 h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-3xl font-light" style={{ lineHeight: '1' }}>6.34</span>
                  <span className="text-gray-400 text-sm ml-2" style={{ lineHeight: '1' }}>/km</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: 200x50 */}
          <div className="flex">
            <div className="w-[200px] h-[50px] border border-white flex items-center px-6">
              {isLoading ? (
                <Skeleton className="w-16 h-5" />
              ) : (
                <span className="text-white text-xl font-light" style={{ lineHeight: '1' }}>Pace</span>
              )}
            </div>
            <div className="w-[200px] h-[50px] border border-white flex items-center justify-center px-6">
              {isLoading ? (
                <Skeleton className="w-28 h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-3xl font-light" style={{ lineHeight: '1' }}>08'07"</span>
                  <span className="text-gray-400 text-sm ml-2" style={{ lineHeight: '1' }}>/km</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: 200x50 */}
          <div className="flex">
            <div className="w-[200px] h-[50px] border border-white flex items-center px-6">
              {isLoading ? (
                <Skeleton className="w-28 h-5" />
              ) : (
                <span className="text-white text-xl font-light" style={{ lineHeight: '1' }}>Total Time</span>
              )}
            </div>
            <div className="w-[200px] h-[50px] border border-white flex items-center justify-center px-6">
              {isLoading ? (
                <Skeleton className="w-32 h-6" />
              ) : (
                <div className="text-center w-full">
                  <span className="text-white text-3xl font-light" style={{ lineHeight: '1' }}>1:05'37"</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 6: 200x113 */}
          <div className="flex">
            <div className="w-[200px] h-[113px] border border-white flex flex-col p-2">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                  <>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Day1</span>
                      <span>45</span>
                    </div>
                    <div className="flex-1">
                      <BarChart data={redChartData} color="#ff4444" />
                    </div>
                  </>
                )}
            </div>
            <div className="w-[200px] h-[113px] border border-white flex flex-col p-2 relative">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                  <>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Day1</span>
                      <span>Day45</span>
                    </div>
                    <div className="flex-1 relative">
                      <BarChart 
                        data={blueChartData} 
                        color="#4488ff" 
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
                      <div className="absolute bottom-1 left-2">
                        <span className="text-white text-2xl font-light">-17kg</span>
                      </div>
                      <div className="absolute bottom-1 right-2 text-xs text-gray-400">1kg</div>
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Row 7: 114x156 & 288x156 */}
          <div className="flex">
            <div className="w-[114px] h-[156px] border border-white flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-16 h-10" />
              ) : (
                <span className="text-white text-5xl font-light">SUN</span>
              )}
            </div>
            <div className="w-[288px] h-[156px] border border-white flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="w-40 h-20" />
                  <Skeleton className="w-12 h-10" />
                </>
              ) : (
                <>
                  <span className="text-white text-8xl font-light">2:54</span>
                  <span className="text-gray-400 text-3xl">PM</span>
                </>
              )}
            </div>
          </div>

          {/* Row 8: 400x46 */}
          <div className="w-[400px] h-[46px] border border-white"></div>

          {/* Row 9: 400x176 */}
          <div className="w-[400px] h-[176px] border border-white flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-32 h-16" />
            ) : (
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 30L100 30M70 10L100 30L70 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
