'use client';

import React from 'react';

interface ViewPlanButtonProps {
  isLoading?: boolean;
  onClick?: () => void;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const ViewPlanButton: React.FC<ViewPlanButtonProps> = ({ isLoading, onClick }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  return (
    <div 
      className="w-full h-full flex items-center justify-center relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Standard button container with consistent aspect ratio */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 w-2/5"
        style={{ aspectRatio: 931 / 230, maxHeight: '56px' }}
      >
        <img
          src="/vectors/button-frame.svg"
          alt="Button Frame"
          className="w-full h-full object-contain absolute inset-0"
          style={{ transform: 'scaleX(-1)' }}
        />
        <span 
          className="text-white font-bold z-10 text-base sm:text-lg" 
          style={{ 
            fontFamily: 'var(--font-hanalei-fill)', 
            lineHeight: '1'
          }}
        >
          VIEW PLAN
        </span>
      </div>
    </div>
  );
};

export default ViewPlanButton;
