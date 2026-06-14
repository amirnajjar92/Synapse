'use client';

import React from 'react';

interface PromptBoxProps {
  value: string;
  onChange: (text: string) => void;
  isLoading?: boolean;
  usePlannerStyle?: boolean; // Whether to use planner page specific width
  placeholder?: string;
  autoGrow?: boolean;
  onSend?: () => void;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const PromptBox: React.FC<PromptBoxProps> = ({ 
  value, 
  onChange, 
  isLoading, 
  usePlannerStyle = false,
  placeholder = "Enter your fitness goals...",
}) => {
  // Don't show skeleton while generating, show the input directly
  // if (isLoading) {
  //   return <Skeleton className="w-full h-full rounded-lg" />;
  // }

  return (
    <div className="w-full h-full relative transition-all duration-300 ease-out">
      {/* Only show frame if using planner style */}
      {usePlannerStyle && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/vectors/prompt-box-frame.svg"
            alt="Prompt Box Frame"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {/* Input container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="flex items-start justify-start p-2 sm:p-3 md:p-4 relative transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{
            width: usePlannerStyle 
              ? `calc(${(327 / 400) * 100}% - 36px)` 
              : 'calc(100% - 30px)',
            height: usePlannerStyle ? `${(125 / 206) * 100}%` : '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px'
          }}
        >
          {/* TELL ME text container (only for planner) */}
          {usePlannerStyle && (
            <div className="absolute w-full top-[-30px] left-0 pointer-events-none">
              <span 
                className="text-white font-bold" 
                style={{ 
                  fontFamily: 'var(--font-hanalei-fill)', 
                  fontSize: 'calc((100vh * 0.95) * (31 / 874))',
                  lineHeight: '1'
                }}
              >
                TELL ME
              </span>
            </div>
          )}
          <textarea
            className="w-full h-full text-gray-800 text-sm sm:text-base md:text-xl font-light text-left bg-transparent border-none resize-none outline-none placeholder-gray-400 focus:ring-0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
};

export default PromptBox;
