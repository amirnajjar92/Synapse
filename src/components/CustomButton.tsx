'use client';

import React from 'react';

interface CustomButtonProps {
  text: string;
  isLoading?: boolean;
  onClick?: () => void;
  reverseY?: boolean;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100% opacity-50 ${className}`} />
);

const CustomButton: React.FC<CustomButtonProps> = ({ text, isLoading, onClick, reverseY }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  return (
    <div 
      className="w-full h-full relative flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      onClick={onClick}
    >
      <img
        src="/vectors/button-frame.svg"
        alt="Button Frame"
        className="w-full h-full object-contain absolute inset-0"
        style={reverseY ? { transform: 'scaleY(-1)' } : undefined}
      />
      <span 
        className="text-white font-bold relative z-10" 
        style={{ 
          fontFamily: 'var(--font-hanalei-fill)', 
          fontSize: 'calc((100vh * 0.95 * 0.0595) * 0.6)', 
          lineHeight: '1' 
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default CustomButton;
