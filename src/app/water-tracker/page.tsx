'use client';

import { useEffect, useState } from 'react';
import BurgerMenuButton from '@/components/BurgerMenuButton';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

// Water Bottle SVG with dynamic water levels and smooth transitions
const WaterBottleFiller = ({ waterLevel, isAlertActive, alertBlink }: { waterLevel: number, isAlertActive: boolean, alertBlink: boolean }) => {
  // We have 12 rectangles, bottom to top (indices 1 to 12, bottom to top)
  const numRects = 12;
  const activeRects = Math.round((waterLevel / 100) * numRects);

  // Function to get style for each rect with smooth transition
  const getRectStyle = (index: number) => {
    const isActive = activeRects >= index;
    return {
      fill: isAlertActive ? (alertBlink ? "#FFFFFF" : "#3659B8") : "#3659B8",
      opacity: isActive ? 1 : 0,
      transition: isAlertActive ? "fill 0.1s ease-out" : "opacity 0.2s ease-out"
    } as React.CSSProperties;
  };

  return (
    <svg 
      viewBox="0 0 1132 2717" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain"
      style={{ filter: "none", overflow: "visible" }}
    >
      {/* 12 rectangles, from bottom (index 1) to top (index 12) */}
      <rect x="91" y="2489" width="946" height="170" style={getRectStyle(1)} />
      <rect x="91" y="2144" width="946" height="345" style={getRectStyle(2)} />
      <rect x="91" y="1799" width="946" height="345" style={getRectStyle(3)} />
      <rect x="95" y="1463" width="946" height="336" style={getRectStyle(4)} />
      <rect x="95" y="1127" width="946" height="336" style={getRectStyle(5)} />
      <rect x="95" y="791" width="946" height="336" style={getRectStyle(6)} />
      <rect x="95" y="666" width="946" height="125" style={getRectStyle(7)} />
      <rect x="205" y="541" width="714" height="125" style={getRectStyle(8)} />
      <rect x="331" y="416" width="487" height="125" style={getRectStyle(9)} />
      <rect x="353" y="291" width="441" height="125" style={getRectStyle(10)} />
      <rect x="353" y="53" width="441" height="238" style={getRectStyle(11)} />
    </svg>
  );
};

export default function WaterTrackerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [waterLevel, setWaterLevel] = useState(10); // Percentage of water filled (0-100)
  const [activeTimeIndex, setActiveTimeIndex] = useState(2); // 0: 12:00, 1: 05:20, 2:03:30, 3:02:00
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertBlink, setAlertBlink] = useState(false);

  // Timeline items
  const timeItems = [
    { id: 0, label: "12:00" },
    { id: 1, label: "05:20" },
    { id: 2, label: "03:30" },
    { id: 3, label: "02:00" }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Alert blink animation
  useEffect(() => {
    let blinkInterval: NodeJS.Timeout;
    if (isAlertActive) {
      blinkInterval = setInterval(() => {
        setAlertBlink(prev => !prev);
      }, 300);
    } else {
      setAlertBlink(false);
    }
    return () => clearInterval(blinkInterval);
  }, [isAlertActive]);

  // Handle time item click
  const handleTimeClick = (index: number) => {
    setActiveTimeIndex(index);
    setIsAlertActive(true);
  };

  // Increase water level when clicking plus (each click adds ~16.67% = 1 rectangle)
  const handleAddWater = () => {
    setWaterLevel(prev => Math.min(prev + (100 / 12), 100)); // Max 100%
    setIsAlertActive(false); // Stop alert when adding water
  };

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
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
          className="w-full h-full flex flex-col relative"
          style={{ backgroundColor: '#2C2C2C' }}
        >
          {/* Burger Menu Button */}
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>
          
          {/* Row 1: 400x144 */}
          <div className="flex w-full h-[16.48%]">
            {/* Column 1 - left cell */}
            <div className="w-1/2 h-full border border-[#3B3B3B00] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-20 sm:w-28 md:w-32 h-6 sm:h-8 md:h-10" />
              ) : (
                <span className="text-white text-2xl sm:text-3xl md:text-4xl font-light">2026/05</span>
              )}
            </div>
            {/* Column 2 - right cell */}
            <div className="w-1/2 h-full border border-[#3B3B3B00] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-20 sm:w-24 md:w-28 h-8 sm:h-10 md:h-12" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light">DONE</span>
              )}
            </div>
          </div>

          {/* Row 2: 200x84 (2 columns) */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-24 sm:w-32 md:w-40 h-6 sm:h-8 md:h-10" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl md:text-5xl font-light">WATER</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-24 sm:w-32 md:w-40 h-6 sm:h-8 md:h-10" />
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

          {/* Row 3: 400x461 */}
          <div className="w-full h-[52.75%] border border-[#3B3B3B] flex items-stretch">
            {/* Left Timeline */}
            <div className="w-[31.75%] h-full flex flex-col justify-around items-center py-4">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <div className="relative flex flex-col justify-around h-full">
                  {/* Timeline items */}
                  {timeItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="relative w-full flex justify-center cursor-pointer"
                      onClick={() => handleTimeClick(index)}
                    >
                      {/* Red arrow - only for active time */}
                      {activeTimeIndex === index && (
                        <svg 
                          className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-0 transition-all duration-300 ease-out" 
                          width="24" 
                          height="40" 
                          viewBox="0 0 24 40" 
                          fill="none"
                        >
                          <path d="M12 0L22 10L17 10L17 40L7 40L7 10L2 10L12 0Z" fill="#E63416"/>
                        </svg>
                      )}
                      <span 
                        className={`text-xl sm:text-2xl md:text-3xl font-light relative z-10 ${activeTimeIndex === index ? "text-white" : "text-gray-400"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                  {/* Vertical line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#E63416] to-transparent transform -translate-x-1/2"></div>
                </div>
              )}
            </div>
            
            {/* Center Water Bottle */}
            <div 
              className="relative flex items-center justify-center"
              style={{
                width: '36.5%',
                height: '100%',
              }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <>
                  {/* Blue Water Filler - SVG */}
                  <div className="absolute bottom-[12.04%] left-0 right-0 mx-auto w-full h-[75.92%] transition-all duration-200 ease-out" style={{ filter: "none" }}>
                    <WaterBottleFiller 
                      waterLevel={waterLevel} 
                      isAlertActive={isAlertActive}
                      alertBlink={alertBlink}
                    />
                  </div>
                  <img
                    src="/vectors/water-bottle.svg"
                    alt="Water Bottle"
                    className="w-full h-[75.92%] object-contain relative z-10"
                    style={{ 
                      transition: "filter 0.1s ease-out",
                      filter: isAlertActive ? (alertBlink ? "brightness(0) invert(1)" : "none") : "none"
                    }}
                  />
                </>
              )}
            </div>
            
            {/* Right Plus Button */}
            <div className="w-[31.75%] h-full flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full" />
              ) : (
                <div className="relative cursor-pointer" onClick={handleAddWater}>
                  {/* Circle border */}
                  <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] border-2 border-white rounded-full flex items-center justify-center">
                    {/* Plus sign */}
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40" 
                      fill="none"
                      className="sm:w-12 sm:h-12 md:w-16 md:h-16"
                    >
                      <path d="M20 5V35M5 20H35" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: 400x176 */}
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