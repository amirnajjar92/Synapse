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
      {/* 200x50 container */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          width: '50%', // 200/400
          height: `${(50 / 106) * 100}%`, // 50px tall relative to row height
        }}
      >
        <img
          src="/vectors/button-frame.svg"
          alt="Button Frame"
          className="w-full h-full object-contain absolute inset-0"
          style={{ transform: 'scaleX(-1)' }}
        />
        <span 
          className="text-white font-bold z-10" 
          style={{ 
            fontFamily: 'var(--font-hanalei-fill)', 
            fontSize: 'calc((100vh * 0.80) * (37 / 874))',
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
