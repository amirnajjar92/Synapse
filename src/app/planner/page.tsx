'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import GoalsSection from '@/components/GoalsSection';
import ViewPlanButton from '@/components/ViewPlanButton';
import useMakePlan from '@/lib/hooks/useMakePlan';
import usePromptEnhancer from '@/lib/hooks/usePromptEnhancer';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setPromptText, resetPlan } from '@/lib/redux/slices/planSlice';

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlannerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { promptText, planGenerated, isGenerating } = useAppSelector((state) => state.plan);
  const [localPromptText, setLocalPromptText] = useState('I want to lose 10kg in 30 days and I am 85kg now');
  const [enhancedPromptText, setEnhancedPromptText] = useState('I want to lose 10kg in 30 days and I am 85kg now');

  const { enhancePrompt } = usePromptEnhancer();
  const { generatePlan } = useMakePlan(enhancedPromptText);

  // Initial load
  useEffect(() => {
    dispatch(setPromptText(localPromptText));
  }, []);

  const handleGoClick = async () => {
    console.log('=== Prompt Enhancer ===');
    console.log('Original prompt:', localPromptText);
    const enhanced = await enhancePrompt(localPromptText);
    console.log('Enhanced prompt:', enhanced);
    console.log('=======================');
    setEnhancedPromptText(enhanced);
    dispatch(setPromptText(localPromptText));
    await generatePlan();
  };

  const handleViewPlanClick = () => {
    router.push('/plan-detail');
  };

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

  // Dynamic dimensions based on state
  const row1Height = planGenerated ? 370 : 302;
  const row2Height = planGenerated ? 114 : 206;
  const row3Height = planGenerated ? 106 : 52;
  const row4Height = planGenerated ? 206 : 0;
  const row5Height = planGenerated ? 52 : 0;
  const row6Height = planGenerated ? 30 : 0;

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
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Row 1: 400 X (370 or 302) */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out"
            style={{ height: `${(row1Height / 874) * 100}%` }}
          >
            {isGenerating || planGenerated ? (
              <GoalsSection isLoading={false} />
            ) : null}
          </div>

          {/* Row 3: 400 X (106 or 52) - VIEW PLAN BUTTON (Moved up) */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row3Height / 874) * 100}%` }}
            >
              <ViewPlanButton isLoading={false} onClick={handleViewPlanClick} />
            </div>
          )}

          {/* Row 2: 400 X (114 or 206) */}
          {!planGenerated && !isGenerating ? (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out"
              style={{ height: `${(row2Height / 874) * 100}%` }}
            >
              <PromptBox
                value={localPromptText}
                onChange={setLocalPromptText}
                isLoading={false}
                usePlannerStyle={true}
              />
            </div>
          ) : (
            <div 
              className="w-full border border-[#3B3B3B00] transition-all duration-500 ease-out flex items-center justify-center"
              style={{ height: `${(row2Height / 874) * 100}%` }}
            >
              {planGenerated && (
                <p 
                  className="text-white font-bold"
                  style={{
                    fontFamily: 'var(--font-hanalei-fill)',
                    fontSize: 'calc((100vh * 0.95) * (24 / 874))',
                  }}
                >
                  Plan is ready!
                </p>
              )}
            </div>
          )}

          {/* Row 4: 400 X 206 - only when plan is generated (PromptBox moved here) */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row4Height / 874) * 100}%` }}
            >
              <PromptBox
                value={localPromptText}
                onChange={setLocalPromptText}
                isLoading={false}
                usePlannerStyle={true}
              />
            </div>
          )}

          {/* Row 5: 176 X 52 + 226 X 52 */}
          <div 
            className="flex w-full border border-[#3B3B3B00] transition-all duration-300"
            style={{ height: `${(52 / 874) * 100}%` }}
          >
            <div 
              className="h-full border border-[#3B3B3B00] flex items-center justify-center"
              style={{ width: `${(176 / 400) * 100}%` }}
            />
            <div 
              className="h-full border border-[#3B3B3B00] flex items-center justify-center p-1 sm:p-2 relative"
              style={{ width: `${(226 / 400) * 100}%` }}
            >
              <CustomButton
                text="GO"
                isLoading={isGenerating}
                onClick={handleGoClick}
              />
            </div>
          </div>

          {/* Row 6: 400 X 30 - only when plan is generated */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] transition-all duration-500 ease-out"
              style={{ height: `${(row6Height / 874) * 100}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
