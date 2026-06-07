'use client';

import React from 'react';

interface GoalsSectionProps {
  isLoading?: boolean;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const GoalsSection: React.FC<GoalsSectionProps> = ({ isLoading }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  const planItems = [
    'Daily Meal Plan',
    'Running / Cardio Plan',
    'Nutrients',
    'Suppliments',
    'Recomended',
    'Challenges',
  ];

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 transition-all duration-300 ease-out">
      {/* Goals Header */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 border-b border-gray-600 pb-3 sm:pb-4 md:pb-6">
        <h2 
          className="text-white font-bold" 
          style={{ 
            fontFamily: 'var(--font-hanalei-fill)', 
            fontSize: 'calc((100vh * 0.95) * (40 / 874))',
            lineHeight: '1'
          }}
        >
          GOALS
        </h2>
        <div className="border-l border-gray-500 pl-3 sm:pl-4 md:pl-6">
          <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light mb-1">
            Lose 10 kg in 30 days
          </p>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light mb-1">
            Starting Weight: 85 kg
          </p>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light">
            → Target: 75 kg
          </p>
        </div>
      </div>

      {/* Plan Items */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Vertical Column Line */}
        <div 
          className="absolute top-0 bottom-0 border-l border-gray-600 transition-all duration-300"
          style={{ right: '25%' }}
        />
        {planItems.map((item, index) => (
          <div 
            key={index} 
            className="grid grid-cols-4 gap-0 items-center border-b border-gray-600 py-1.5 sm:py-2 md:py-3 transition-all duration-200 hover:bg-gray-800/30"
          >
            <span className="text-gray-300 text-xs sm:text-sm md:text-base font-light col-span-3 pl-1 sm:pl-2 md:pl-3">
              {item}
            </span>
            <div className="col-span-1 flex items-center justify-center">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                className="sm:w-6 sm:h-6 md:w-8 md:h-8"
              >
                <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsSection;
