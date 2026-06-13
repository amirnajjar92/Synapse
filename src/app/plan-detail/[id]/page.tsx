'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import PlanTable from '@/components/PlanTable';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCurrentTableIndex, setPromptText, setPlanTypes } from '@/lib/redux/slices/planSlice';

interface PlanTableData {
  id: number;
  title: string;
  icon: string;
  tableData: any[];
  columnWidths?: string[];
  horizontalScroll: boolean;
}

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: any[];
  createdAt: string;
  updatedAt: string;
}

// Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlanDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { planTypes, currentTableIndex, promptText, isGenerating } = useAppSelector((state) => state.plan);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockPlanStatus, setMockPlanStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'>('NOT_STARTED');

  // Fetch plan from API using id OR use existing Redux plan if available
  useEffect(() => {
    const fetchPlan = async () => {
      if (!id || typeof id !== 'string') return;

      // First, check if we already have a plan in Redux (just generated)
      if (planTypes.length > 0) {
        setHasLoaded(true);
        return;
      }

      // Otherwise, fetch from API
      // Get user email from localStorage
      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      try {
        // Use query parameter for email since GET requests shouldn't have a body
        const url = new URL(`/api/plans/${id}`, window.location.origin);
        if (user?.email) {
          url.searchParams.set('email', user.email);
        }
        const finalResponse = await fetch(url.toString());
        
        if (!finalResponse.ok) {
          throw new Error('Failed to fetch plan');
        }
        const data = await finalResponse.json();
        const plan: Plan = data.plan;

        // Convert the plan.tables to the planTypes format we use in Redux
        const convertedPlanTypes: PlanTableData[] = (plan.tables || []).map((table: any, index: number) => ({
          id: index,
          title: table.title || `Table ${index + 1}`,
          icon: plan.icon || '/vectors/plan-icon.svg',
          tableData: (table.rows || []).map((row: any, rowIndex: number) => ({
            id: row.id || rowIndex,
            columns: row.columns || []
          })),
          columnWidths: table.columnWidths,
          horizontalScroll: table.horizontalScroll || false
        }));
        
        dispatch(setPlanTypes(convertedPlanTypes));
        dispatch(setPromptText(plan.prompt));
        setError(null);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load plan');
      } finally {
        setHasLoaded(true);
      }
    };

    fetchPlan();
  }, [id, dispatch, planTypes.length]);

  // Get current plan
  const currentPlan = planTypes[currentTableIndex];

  // Handle next button click
  const handleNextTable = () => {
    const nextIndex = (currentTableIndex + 1) % planTypes.length;
    dispatch(setCurrentTableIndex(nextIndex));
  };

  // Handle prev button click
  const handlePrevTable = () => {
    const prevIndex = (currentTableIndex - 1 + planTypes.length) % planTypes.length;
    dispatch(setCurrentTableIndex(prevIndex));
  };

  // Handle back button click
  const handleBackClick = () => {
    router.push('/my-plans');
  };

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

  // Row heights based on size guide
  const headerHeight = 100;
  const tableHeight = 360;
  const emptyRowHeight = 100;

  if (!hasLoaded) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <Skeleton className="w-40 h-10 rounded" />
      </div>
    );
  }

  if (planTypes.length === 0) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400">No plan selected</p>
          <button
            onClick={() => router.push('/planner')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Go to Planner
          </button>
        </div>
      </div>
    );
  }

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
              onPrev={handlePrevTable}
              horizontalScroll={currentPlan.horizontalScroll}
              tableTitles={planTypes.map(p => p.title)}
              currentTableIndex={currentTableIndex}
              onTabClick={(index) => dispatch(setCurrentTableIndex(index))}
            />
          </div>

          {/* Row 3: Status Controls - 400 X 100 */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-center"
            style={{ height: `${(emptyRowHeight / baseHeight) * 100}%` }}
          >
            <button
              onClick={() => {
                // Mock handler to cycle through statuses for preview
                if (mockPlanStatus === 'NOT_STARTED') setMockPlanStatus('IN_PROGRESS');
                else if (mockPlanStatus === 'IN_PROGRESS') setMockPlanStatus('PAUSED');
                else if (mockPlanStatus === 'PAUSED') setMockPlanStatus('IN_PROGRESS');
                else setMockPlanStatus('NOT_STARTED');
              }}
              className="px-4 py-2 rounded-full font-semibold text-white transition-all hover:scale-105 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {mockPlanStatus === 'NOT_STARTED' ? 'START PLAN' :
               mockPlanStatus === 'IN_PROGRESS' ? 'PAUSE PLAN' :
               mockPlanStatus === 'PAUSED' ? 'RESUME PLAN' :
               'RESTART PLAN'}
            </button>
          </div>

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
