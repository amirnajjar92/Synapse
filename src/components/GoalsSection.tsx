'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';

interface GoalsSectionProps {
  isLoading?: boolean;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-2 border-t-transparent border-white ${className}`} />
);

const GoalsSection: React.FC<GoalsSectionProps> = ({ isLoading }) => {
  const { planItemLoadingStates, promptText, isGenerating, planGenerated, planTitle } = useAppSelector((state) => state.plan);
  const [revealedCount, setRevealedCount] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);
  const prevGenerating = useRef(isGenerating);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // If already generated on mount, show all ticks immediately
    if (planGenerated && !hasAnimated.current) {
      setRevealedCount(6);
      setAllRevealed(true);
      hasAnimated.current = true;
      return;
    }

    // Reset when generation starts
    if (isGenerating && !prevGenerating.current) {
      setRevealedCount(0);
      setAllRevealed(false);
      hasAnimated.current = false;
    }

    // When generation finishes, start sequential reveal
    if (!isGenerating && prevGenerating.current && !hasAnimated.current) {
      hasAnimated.current = true;
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= 6) {
          clearInterval(interval);
          setAllRevealed(true);
        }
      }, 400);
      return () => clearInterval(interval);
    }

    prevGenerating.current = isGenerating;
  }, [isGenerating, planGenerated]);

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

  const displayTitle = planTitle || (promptText ? promptText.length > 60 ? promptText.slice(0, 60) + '...' : promptText : 'Your fitness goal here');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tickReveal {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
      <div className="w-full flex flex-col pt-3 sm:pt-4 md:pt-6 pb-0 pl-14 sm:pl-16 md:pl-18 pr-14 sm:pr-16 md:pr-18 transition-all duration-300 ease-out">
      {/* Goals Header */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 border-b border-gray-600 pb-3 sm:pb-4 md:pb-6">
        <h2 
          className="text-white font-bold text-2xl sm:text-3xl md:text-4xl" 
          style={{ 
            fontFamily: 'var(--font-hanalei-fill)', 
            lineHeight: '1'
          }}
        >
          GOALS
        </h2>
        <div className="border-l border-gray-500 pl-3 sm:pl-4 md:pl-6">
          <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light truncate max-w-full">
            {displayTitle}
          </p>
        </div>
      </div>

      {/* Plan Items */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {planItems.map((item, index) => {
          const isRevealed = revealedCount > index;
          const stillLoading = planItemLoadingStates[index] && !isRevealed;

          return (
            <div 
              key={index} 
              className="grid grid-cols-4 gap-0 items-center border-b border-gray-600 py-1.5 sm:py-2 md:py-3 transition-all duration-300 hover:bg-gray-800/30"
            >
              <span className="text-gray-300 text-xs sm:text-sm md:text-base font-light col-span-3 pl-1 sm:pl-2 md:pl-3">
                {item}
              </span>
              <div className="col-span-1 flex items-center justify-center">
                {stillLoading && (
                  <Spinner className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                )}
                {isRevealed && (
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="sm:w-6 sm:h-6 md:w-8 md:h-8"
                    style={{ animation: 'tickReveal 0.3s ease-out' }}
                  >
                    <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}

        {/* Plan Completed Row */}
        {allRevealed && (
          <div 
            className="grid grid-cols-4 gap-0 items-center border-t-2 border-gray-500 py-2 sm:py-2.5 md:py-3"
            style={{ animation: 'tickReveal 0.4s ease-out' }}
          >
            <span className="text-white text-xs sm:text-sm md:text-base font-semibold col-span-3 pl-1 sm:pl-2 md:pl-3">
              Plan Completed
            </span>
            <div className="col-span-1 flex items-center justify-center">
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none"
                className="sm:w-7 sm:h-7 md:w-9 md:h-9"
              >
                <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2" fill="none" />
                <path d="M8 12L11 15L16 9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default GoalsSection;
