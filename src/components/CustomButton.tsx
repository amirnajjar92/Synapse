'use client';

import React from 'react';

interface CustomButtonProps {
  text: string;
  isLoading?: boolean;
  onClick?: () => void;
  width?: string;
  fontSize?: string;
  mirror?: boolean;
  color?: string;
  lightMode?: boolean;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const CustomButton: React.FC<CustomButtonProps> = ({ text, isLoading, onClick, width, fontSize, mirror, color, lightMode }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  // SVG aspect ratio: width / height = 931 / 230 ≈ 4.047
  const svgAspectRatio = 931 / 230;

  return (
    <div 
      className={`relative flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer ${width ? '' : 'w-full'}`}
      onClick={onClick}
      style={
        width 
          ? { width, aspectRatio: svgAspectRatio } 
          : { aspectRatio: svgAspectRatio }
      }
    >
      <img
        src="/vectors/button-frame.svg"
        alt="Button Frame"
        className="w-full h-full object-contain absolute inset-0"
        style={{
          transform: mirror ? 'scaleX(-1)' : undefined,
          filter: lightMode ? 'invert(1)' : undefined
        }}
      />
      <span 
        className="font-bold relative z-10" 
        style={{ 
          fontFamily: 'var(--font-hanalei-fill)', 
          fontSize: fontSize || 'calc((100vh * 0.95 * 0.0595) * 0.6)', 
          lineHeight: '1',
          color: color || '#FFFFFF'
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default CustomButton;
