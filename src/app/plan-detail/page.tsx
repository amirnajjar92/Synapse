'use client';

import { useEffect, useState } from 'react';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlanDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [promptText, setPromptText] = useState('i want a plan for 30 days weight loos -10kg....');

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

  // Row heights based on size guide
  const headerHeight = 100;
  const tableHeight = 360;
  const emptyRowHeight = 100;

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
          className="w-full h-full flex flex-col pb-2 sm:pb-3 md:pb-4"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Row 1: Header - 400 X 100 */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-300"
            style={{ height: `${(headerHeight / baseHeight) * 100}%` }}
          >
            {isLoading ? (
              <div className="flex items-center justify-between w-full px-2">
                <Skeleton className="w-1/2 h-10" />
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            ) : (
              <>
                <h2 
                  className="text-white font-bold"
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: 'calc((100vh * 0.95) * (36 / 874))',
                    lineHeight: '1'
                  }}
                >
                  MEALS
                </h2>
                <img 
                  src="/vectors/meals-icon.svg" 
                  alt="Meals Icon" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </>
            )}
          </div>

          {/* Row 2: Table Section - 400 X 360 */}
          <div 
            className="w-full border border-[#3B3B3B00] flex flex-col overflow-y-auto transition-all duration-300"
            style={{ height: `${(tableHeight / baseHeight) * 100}%` }}
          >
            {isLoading ? (
              <div className="w-full h-full flex flex-col gap-2 p-3">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : (
              <div className="flex flex-col text-gray-300 text-xs sm:text-sm md:text-base font-light">
                {/* Table Row 1 */}
                <div className="flex border-b border-gray-600">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Breakfast</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">08:00</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Oatmeal + Whey Protein + Banana + Almonds</div>
                </div>
                {/* Table Row 2 */}
                <div className="flex border-b border-gray-600">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Snack 1</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">11:00</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Greek Yogurt + Berries + Chia Seeds</div>
                </div>
                {/* Table Row 3 */}
                <div className="flex border-b border-gray-600">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Lunch</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">13:30</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Grilled Chicken + Quinoa + Vegetables + Olive Oil</div>
                </div>
                {/* Table Row 4 */}
                <div className="flex border-b border-gray-600">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Snack 2</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">16:30</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Apple + Handful of Mixed Nuts</div>
                </div>
                {/* Table Row 5 */}
                <div className="flex border-b border-gray-600">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Dinner</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">19:30</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Baked Salmon + Sweet Potato + Salad</div>
                </div>
                {/* Table Row 6 */}
                <div className="flex">
                  <div className="w-1/3 p-2 sm:p-3 md:p-4 border-r border-gray-600">Total</div>
                  <div className="w-1/5 p-2 sm:p-3 md:p-4 border-r border-gray-600">-</div>
                  <div className="flex-1 p-2 sm:p-3 md:p-4">Daily Total</div>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Empty Row - 400 X 100 */}
          <div 
            className="w-full border border-[#3B3B3B00]"
            style={{ height: `${(emptyRowHeight / baseHeight) * 100}%` }}
          />

          {/* Row 4: Prompt Section */}
          <div 
            className="w-full border border-[#3B3B3B00] flex flex-col items-center justify-center p-3 sm:p-4 pb-6 sm:pb-7 md:pb-8"
            style={{ height: `${((baseHeight - headerHeight - tableHeight - emptyRowHeight) / baseHeight) * 100}%` }}
          >
            {/* Prompt Box */}
            <div className="w-full flex items-center justify-center flex-1 overflow-hidden mb-2">
              <PromptBox
                value={promptText}
                onChange={setPromptText}
                isLoading={isLoading}
              />
            </div>
            {/* Buttons Row - 176 + 226 like planner */}
            <div 
              className="flex w-full"
              style={{ height: `${(52 / baseHeight) * 100}%` }}
            >
              {/* Back Button */}
              <div 
                className="h-full flex items-center justify-center px-2"
                style={{ width: `${(176 / 400) * 100}%` }}
              >
                {!isLoading && (
                  <span 
                    className="text-white font-bold"
                    style={{ 
                      fontFamily: 'var(--font-hanalei-fill)', 
                      fontSize: 'calc((100vh * 0.95) * (17.31 / 874))',
                      lineHeight: '1'
                    }}
                  >
                    BACK TO PLANBOOK
                  </span>
                )}
              </div>
              {/* GO Button */}
              <div 
                className="h-full flex items-center justify-center p-1 sm:p-2 relative"
                style={{ width: `${(226 / 400) * 100}%` }}
              >
                <CustomButton
                  text="GO"
                  isLoading={isLoading}
                  // mirror={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
