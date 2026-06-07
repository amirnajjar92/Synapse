'use client';

import React from 'react';
import CustomButton from './CustomButton';

interface ViewPlanButtonProps {
  isLoading?: boolean;
  onClick?: () => void;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100% opacity-50 ${className}`} />
);

const ViewPlanButton: React.FC<ViewPlanButtonProps> = ({ isLoading, onClick }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 relative">
      {/* 200x50 container */}
      <div 
        className="relative"
        style={{
          width: '50%', // 200/400
          height: `${(50 / 106) * 100}%`, // 50px tall relative to row height
        }}
      >
        <CustomButton 
          text="VIEW PLAN" 
          isLoading={isLoading} 
          onClick={onClick} 
          reverseY={true}
        />
      </div>
    </div>
  );
};

export default ViewPlanButton;
