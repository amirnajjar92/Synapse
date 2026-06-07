'use client';

import { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100% opacity-50 ${className}`} />
);

// Item Interface
interface PlanItem {
  id: number;
  name: string;
  icon: string;
}

export default function PlanListPage() {
  const [isLoading, setIsLoading] = useState(true);

  const planItems: PlanItem[] = [
    { id: 1, name: 'CARDIO', icon: '/vectors/cardio-icon.svg' },
    { id: 2, name: 'MEALS', icon: '/vectors/meals-icon.svg' },
    { id: 3, name: 'NUTRIENTS', icon: '/vectors/nutrients-icon.svg' },
    { id: 4, name: 'SUPPLEMENTS', icon: '/vectors/suppliments-icon.svg' },
    { id: 5, name: 'CHALLENGES', icon: '/vectors/challenges-icon.svg' },
    { id: 6, name: 'RECOMMENDED', icon: '/vectors/recomended-icon.svg' },
  ];

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
          className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Header */}
          <div className="mb-6">
            {isLoading ? (
              <Skeleton className="w-3/4 h-6" />
            ) : (
              <p className="text-gray-400 text-base sm:text-lg md:text-xl font-light">
                SELECT ITEMS TO VIEW DETAILE
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-4 mb-6 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-20 rounded-lg" />
              ))
            ) : (
              planItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-[#2c2c2c] rounded-lg border border-gray-600 transition-all duration-200 hover:bg-gray-700/50 cursor-pointer"
                >
                  <h3 
                    className="text-white font-bold"
                    style={{ 
                      fontFamily: 'var(--font-hanalei-fill)', 
                      fontSize: 'calc((100vh * 0.95) * (32 / 874))',
                      lineHeight: '1'
                    }}
                  >
                    {item.name}
                  </h3>
                  <img 
                    src={item.icon} 
                    alt={item.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                  />
                </div>
              ))
            )}
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col gap-4">
            {/* Start Button */}
            <div className="flex items-center justify-center">
              <CustomButton 
                text="START" 
                isLoading={isLoading} 
              />
            </div>
            
            {/* Subtext */}
            {!isLoading && (
              <p className="text-gray-400 text-sm sm:text-base font-light text-center">
                YOUR PLAN IS READY TO START
              </p>
            )}

            {/* Divider OR */}
            {!isLoading && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 h-px bg-gray-600" />
                <span className="text-gray-400 text-base font-light">OR</span>
                <div className="flex-1 h-px bg-gray-600" />
              </div>
            )}

            {/* Change By AI Button */}
            <div className="flex items-center justify-center">
              <CustomButton 
                text="CHANGE BY AI" 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
