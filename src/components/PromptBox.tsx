'use client';

import React from 'react';

interface PromptBoxProps {
  value: string;
  onChange: (text: string) => void;
  isLoading?: boolean;
  usePlannerStyle?: boolean; // Whether to use planner page specific width
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const PromptBox: React.FC<PromptBoxProps> = ({ value, onChange, isLoading, usePlannerStyle = false }) => {
  // Don't show skeleton while generating, show the input directly
  // if (isLoading) {
  //   return <Skeleton className="w-full h-full rounded-lg" />;
  // }

  return (
    <div className="w-full h-full relative transition-all duration-300 ease-out">
      {/* Frame container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/vectors/prompt-box-frame.svg"
          alt="Prompt Box Frame"
          className="w-full h-full object-contain"
        />
      </div>
      {/* Input container - matches frame exactly */}
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
        <div 
          className="w-full h-full relative transition-all duration-200"
          style={{ backgroundColor: 'transparent' }}
        >
          {/* TELL ME text container */}
          <div className="absolute w-full top-[-30px] left-0 pointer-events-none">
            <span 
              className="text-black font-bold"
              style={{ 
                fontFamily: 'var(--font-hanalei-fill)', 
                fontSize: 'calc((100vh * 0.95) * (31 / 874))',
                lineHeight: '1'
              }}
            >
              TELL ME
            </span>
          </div>
          <textarea
            className="w-full h-full text-black text-sm sm:text-base md:text-xl font-light text-left bg-transparent border-none resize-none outline-none placeholder-gray-400 focus:ring-0 overflow-hidden"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your fitness goal... (e.g., Lose 5kg in 30 days, Build muscle for marathon, Improve endurance)"
          />
        </div>
      </div>
    </div>
  );
};

export default PromptBox;
