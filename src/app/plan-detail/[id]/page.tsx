'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlanModifyDialog from '@/components/PlanModifyDialog';
import CustomButton from '@/components/CustomButton';
import PlanTable from '@/components/PlanTable';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import Skeleton from '@/components/ui/Skeleton';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCurrentTableIndex, setPromptText, setPlanTypes } from '@/lib/redux/slices/planSlice';
import { exportPlanToPDF } from '@/lib/pdfExport';
import { iconMap, defaultIcons } from '@/lib/constants/planIcons';
import usePlanModifier from '@/lib/hooks/usePlanModifier';

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
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PlanDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { planTypes, currentTableIndex, isGenerating } = useAppSelector((state) => state.plan);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const { updateCell, updateRow, addRow, removeRow, batchUpdateTables, getPlanSnapshot } = usePlanModifier(plan ? String(id) : null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id || typeof id !== 'string') return;

      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;

      try {
        const url = new URL(`/api/plans/${id}`, window.location.origin);
        if (user?.email) url.searchParams.set('email', user.email);
        const finalResponse = await fetch(url.toString());

        if (!finalResponse.ok) throw new Error('Failed to fetch plan');
        const data = await finalResponse.json();
        const planData: Plan = data.plan;

        setPlan(planData);

        const convertedPlanTypes: PlanTableData[] = (planData.tables || []).map((table: any, index: number) => ({
          id: index,
          title: table.title || `Table ${index + 1}`,
          icon: iconMap[table.title] || defaultIcons[index] || planData.icon || '/vectors/plan-icon.svg',
          tableData: (table.rows || []).map((row: any, rowIndex: number) => ({
            id: row.id || rowIndex,
            columns: row.columns || [],
          })),
          columnWidths: table.columnWidths,
          horizontalScroll: table.horizontalScroll || false,
        }));

        dispatch(setPlanTypes(convertedPlanTypes));
        dispatch(setPromptText(planData.prompt));
        setError(null);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load plan');
      } finally {
        setHasLoaded(true);
      }
    };

    fetchPlan();
  }, [id, dispatch]);

  const currentPlan = planTypes[currentTableIndex];

  const handleNextTable = () => {
    dispatch(setCurrentTableIndex((currentTableIndex + 1) % planTypes.length));
  };

  const handlePrevTable = () => {
    dispatch(setCurrentTableIndex((currentTableIndex - 1 + planTypes.length) % planTypes.length));
  };

  const getPlanDurationInDays = async (prompt: string): Promise<number> => {
    const weekMatch = prompt.match(/(\d+)\s*week/i);
    if (weekMatch) return parseInt(weekMatch[1]) * 7;
    const monthMatch = prompt.match(/(\d+)\s*month/i);
    if (monthMatch) return parseInt(monthMatch[1]) * 30;
    const dayMatch = prompt.match(/(\d+)\s*day/i);
    if (dayMatch) return parseInt(dayMatch[1]);
    try {
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `You are a helpful assistant. Respond only with a single number: the total number of days for this fitness plan: ${prompt}`,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const number = parseInt(data.answer?.trim());
      if (!isNaN(number)) return number;
    } catch {}
    return 30;
  };

  const handleStatusChange = async () => {
    if (!plan || !id) return;

    const userStr = localStorage.getItem('synapse_user');
    const user = userStr ? JSON.parse(userStr) : null;

    let newStatus: Plan['status'];
    let startDate = plan.startDate;
    let endDate = plan.endDate;

    if (plan.status === 'NOT_STARTED') {
      newStatus = 'IN_PROGRESS';
      startDate = new Date().toISOString();
      try {
        const durationDays = await getPlanDurationInDays(plan.prompt);
        const end = new Date(startDate);
        end.setDate(end.getDate() + durationDays);
        endDate = end.toISOString();
      } catch {
        const end = new Date(startDate);
        end.setDate(end.getDate() + 30);
        endDate = end.toISOString();
      }
    } else if (plan.status === 'IN_PROGRESS') {
      newStatus = 'PAUSED';
    } else if (plan.status === 'PAUSED') {
      newStatus = 'IN_PROGRESS';
    } else {
      newStatus = 'NOT_STARTED';
      startDate = null;
      endDate = null;
    }

    try {
      const url = new URL(`/api/plans/${id}`, window.location.origin);
      if (user?.email) url.searchParams.set('email', user.email);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, startDate, endDate }),
      });
      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Error updating plan status:', err);
    }
  };

  const handleExportPDF = () => {
    if (!plan) return;
    const tablesWithIcons = plan.tables.map((table: any, index: number) => ({
      ...table,
      icon: iconMap[table.title] || defaultIcons[index] || plan.icon,
    }));
    exportPlanToPDF({
      title: plan.title,
      prompt: plan.prompt,
      tables: tablesWithIcons,
      startDate: plan.startDate,
      endDate: plan.endDate,
    });
  };

  const baseWidth = 402;
  const baseHeight = 874;

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
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
        }}
      >
        <div
          className="w-full h-full flex flex-col gap-2 relative pt-10"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Burger Menu - top left */}
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>

          {/* Export PDF - top right */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-700 transition-colors"
              title="Export to PDF"
            >
              <span className="text-[10px] text-gray-400 hover:text-white">PDF</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 hover:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>

          {/* Header - flex-[1] */}
          <div className="flex-[0.5] flex items-center justify-between px-3 sm:px-4 md:px-6 pt-4 pb-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2
                className="text-white font-bold truncate"
                style={{
                  fontFamily: 'var(--font-hanalei-fill)',
                  fontSize: 'calc((100vh * 0.95) * (36 / 874))',
                  lineHeight: '1',
                }}
              >
                {currentPlan.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={currentPlan.icon}
                alt={`${currentPlan.title} Icon`}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>
          </div>

          {/* Table - flex-[3] */}
          <div className="flex-[3] min-h-0 overflow-hidden" style={{ maxHeight: '25vh' }}>
            <PlanTable
              data={currentPlan.tableData}
              columnWidths={currentPlan.columnWidths}
              isLoading={isGenerating}
              horizontalScroll={currentPlan.horizontalScroll}
              showTabs={false}
            />
          </div>

          {/* Tabs - flex-[1] */}
          <div className="flex-[1] min-h-0 flex items-center overflow-hidden px-2" style={{ maxHeight: '6.25vh' }}>
            <div className="w-full flex items-center justify-between gap-1">
              <button
                onClick={handlePrevTable}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Previous table"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="flex gap-1 flex-1 overflow-x-auto hide-scrollbar justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {planTypes.map((p, index) => (
                  <button
                    key={index}
                    onClick={() => dispatch(setCurrentTableIndex(index))}
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                      index === currentTableIndex
                        ? 'bg-white text-black font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextTable}
                className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Next table"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Controls - flex-[1] */}
          <div className="flex-[1] min-h-0 flex items-center justify-center gap-3 overflow-hidden">
            {plan && (
              <CustomButton
                mirror={true}
                text={
                  plan.status === 'NOT_STARTED' ? 'START PLAN' :
                  plan.status === 'IN_PROGRESS' ? 'PAUSE PLAN' :
                  plan.status === 'PAUSED' ? 'RESUME PLAN' :
                  'RESTART PLAN'
                }
                onClick={handleStatusChange}
                width="150px"
                fontSize="16px"
              />
            )}
            <button
              onClick={() => setShowModifyDialog(true)}
              className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-4 py-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Modify with AI
            </button>
          </div>
        </div>
      </div>

      <PlanModifyDialog
        open={showModifyDialog}
        onClose={() => setShowModifyDialog(false)}
        planContext={plan ? `Plan title: ${plan.title}\nPrompt: ${plan.prompt}\nStatus: ${plan.status}` : undefined}
        onApply={async (modificationPrompt, aiResponse) => {
          if (!plan || !id || typeof id !== 'string') return;
          const snapshot = getPlanSnapshot();
          const userStr = localStorage.getItem('synapse_user');
          const user = userStr ? JSON.parse(userStr) : null;
          const res = await fetch('/api/ai/analyse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: `You are a fitness plan data transformer. Given the current plan tables below and the user's modification request, output ONLY valid JSON representing the updated tables. No explanation, no markdown, no code fences—just the JSON array.

Current tables:
${JSON.stringify(snapshot, null, 2)}

Modification request: ${modificationPrompt}

AI analysis of changes: ${aiResponse}

Return a JSON array where each object has "title" (string) and "rows" (array of {columns: string[]}). Preserve the same number of tables and rows; only update column values as needed.`,
            }),
          });
          const data = await res.json();
          let updatedTables;
          try {
            const cleaned = data.answer.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
            updatedTables = JSON.parse(cleaned);
          } catch {
            throw new Error('Failed to parse AI response');
          }
          await batchUpdateTables(updatedTables);
        }}
      />
      <FloatingNavBar />
    </div>
  );
}
