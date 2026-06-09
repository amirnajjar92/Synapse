'use client';

import { useRouter } from 'next/navigation';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import PlanTable from '@/components/PlanTable';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCurrentTableIndex, setPromptText } from '@/lib/redux/slices/planSlice';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlanDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { planTypes, currentTableIndex, promptText, isGenerating } = useAppSelector((state) => state.plan);

  // Get current plan
  const currentPlan = planTypes[currentTableIndex];

  // Handle next button click
  const handleNextTable = () => {
    const nextIndex = (currentTableIndex + 1) % planTypes.length;
    dispatch(setCurrentTableIndex(nextIndex));
  };

  // Handle back button click
  const handleBackClick = () => {
    router.push('/planner');
  };

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
            {/* No skeletons while generating, show the header directly */}
            <>
              <h2 
                className="text-white font-bold"
                style={{ 
                  fontFamily: 'var(--font-hanalei-fill)', 
                  fontSize: 'calc((100vh * 0.95) * (36 / 874))',
                  lineHeight: '1'
                }}
              >
                {currentPlan.title}
              </h2>
              <img 
                src={currentPlan.icon} 
                alt={`${currentPlan.title} Icon`} 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
              />
            </>
          </div>

          {/* Row 2: Table Section - 400 X 360 */}
          <div 
            className="w-full border border-[#3B3B3B00] transition-all duration-300"
            style={{ height: `${(tableHeight / baseHeight) * 100}%` }}
          >
            <PlanTable 
              data={currentPlan.tableData}
              columnWidths={currentPlan.columnWidths}
              isLoading={isGenerating}
              onNext={handleNextTable}
              horizontalScroll={currentPlan.horizontalScroll}
            />
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
                onChange={(text) => dispatch(setPromptText(text))}
                isLoading={isGenerating}
              />
            </div>
            {/* Buttons Row - 176 + 226 like planner */}
            <div 
              className="flex w-full"
              style={{ height: `${(52 / baseHeight) * 100}%` }}
            >
              {/* Back Button */}
              <div 
                className="h-full flex items-center justify-center px-2 cursor-pointer"
                style={{ width: `${(176 / 400) * 100}%` }}
                onClick={handleBackClick}
              >
                {!isGenerating && (
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
                  isLoading={isGenerating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
