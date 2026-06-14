'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAnalysePlanProgress } from '@/lib/hooks/useAnalysePlanProgress';
import { useTodayTable } from '@/lib/hooks/useTodayTable';

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

interface DailyEntry {
  id: string;
  aiAnalysis?: string | null;
  todos?: string[];
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

// Hide scrollbar styles
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

function PlanProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getProgressAnalysis } = useAnalysePlanProgress();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getCurrentDay = () => {
    if (!selectedPlan?.startDate) return 0;
    const start = new Date(selectedPlan.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const { todayTable, isLoading: isTodayTableLoading, regenerate: regenerateTodayTable } = useTodayTable(selectedPlan, getCurrentDay);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Calendar', "Today's Focus", 'AI Analysis'];

  // Check authentication and get user
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/');
    }
  }, [router]);

  // Fetch plans when user is available
  const fetchPlans = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        const data = await response.json();
        const userPlans = data.plans || [];
        setPlans(userPlans);
        
        // Auto-select plan from search params or first active plan
        const planIdFromQuery = searchParams.get('planId');
        const targetPlan = planIdFromQuery 
          ? userPlans.find((p: Plan) => p.id === planIdFromQuery) 
          : userPlans.find((p: Plan) => p.status === 'IN_PROGRESS') || userPlans[0];
        if (targetPlan) {
          setSelectedPlan(targetPlan);
        }
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update selected plan when search params or plans change
  useEffect(() => {
    if (plans.length === 0) return;
    const planIdFromQuery = searchParams.get('planId');
    const targetPlan = planIdFromQuery 
      ? plans.find((p: Plan) => p.id === planIdFromQuery) 
      : plans.find((p: Plan) => p.status === 'IN_PROGRESS') || plans[0];
    if (targetPlan && targetPlan.id !== selectedPlan?.id) {
      setSelectedPlan(targetPlan);
    }
  }, [searchParams, plans]);

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const getTotalDays = () => {
    if (!selectedPlan?.startDate || !selectedPlan?.endDate) return 0;
    const start = new Date(selectedPlan.startDate);
    const end = new Date(selectedPlan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTodayDateStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchTodayEntry = async () => {
    if (!selectedPlan || !user?.email) return null;

    try {
      const url = new URL(`/api/users/me/daily-entries/${encodeURIComponent(getTodayDateStr())}`, window.location.origin);
      url.searchParams.set('email', user.email);
      url.searchParams.set('planId', selectedPlan.id);
      
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        return data.dailyEntry;
      }
    } catch (error) {
      console.error('Error fetching daily entry:', error);
    }
    return null;
  };

  const saveAnalysis = async (analysisText: string) => {
    if (!selectedPlan || !user?.email) return;

    try {
      const response = await fetch('/api/users/me/daily-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          planId: selectedPlan.id,
          date: getTodayDateStr(),
          aiAnalysis: analysisText
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.dailyEntry;
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const handleAnalyzeProgress = async (forceRefresh = false) => {
    if (!selectedPlan || !selectedPlan.startDate || !selectedPlan.endDate) return;

    setIsAnalyzing(true);
    try {
      // Check if we have existing analysis first
      if (!forceRefresh) {
        const existingEntry = await fetchTodayEntry();
        if (existingEntry?.aiAnalysis) {
          setAnalysis(existingEntry.aiAnalysis);
          setIsAnalyzing(false);
          return;
        }
      }

      // Otherwise call API
      const start = new Date(selectedPlan.startDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const result = await getProgressAnalysis(
        selectedPlan.prompt,
        selectedPlan.startDate,
        selectedPlan.endDate,
        diffDays
      );
      setAnalysis(result);

      // Save the analysis
      await saveAnalysis(result);
    } catch (error) {
      console.error('Error analyzing progress:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze progress when selected plan changes
  useEffect(() => {
    if (selectedPlan && selectedPlan.startDate && selectedPlan.endDate) {
      handleAnalyzeProgress();
    }
  }, [selectedPlan]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    if (!selectedPlan?.startDate || !selectedPlan?.endDate) return [];
    
    const planStart = new Date(selectedPlan.startDate);
    const planEnd = new Date(selectedPlan.endDate);
    const today = new Date();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
    
    // Get last day of the month
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    
    // Add empty days for the start of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push({ date: null, isToday: false, isInPlan: false, isPast: false, dayNum: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(calendarYear, calendarMonth, i);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      
      // Check if date is within plan duration
      const isInPlan = date >= planStart && date <= planEnd;
      
      calendarDays.push({ date, isToday, isInPlan, isPast, dayNum: i });
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  // Base dimensions for planner-style frame
  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted || isLoading) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-40 h-6 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      {/* Planner-style iPhone Frame */}
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        <div
          className="w-full h-full flex flex-col overflow-y-auto"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
          {/* Small Header */}
          <div className="p-4 border-b border-gray-700">
            <h1
              className="text-white font-bold"
              style={{
                fontFamily: 'var(--font-hanalei-fill)',
                fontSize: '1.5rem'
              }}
            >
              Plan Progress
            </h1>
          </div>

          {/* Progress Bar */}
          {selectedPlan && (
            <div className="flex w-full border-b border-gray-700">
              {/* Left Cell: Progress Bar */}
              <div className="w-1/2 h-full border-r border-gray-700 flex flex-col p-4">
                <div className="flex justify-between text-gray-300 text-xs mb-1">
                  <span>Day {getCurrentDay()}</span>
                  <span>{getTotalDays()} Days</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min((getCurrentDay() / getTotalDays()) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {/* Right Cell: Day Number */}
              <div className="w-1/2 h-full flex items-center justify-center p-4">
                <span 
                  className="text-white font-bold text-center" 
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: '2rem'
                  }}
                >
                  DAY {getCurrentDay()}
                </span>
              </div>
            </div>
          )}

          {/* Tabs with Prev/Next */}
          {selectedPlan && (
            <div className="flex items-center justify-between p-2 gap-2">
              {/* Previous button */}
              <button
                onClick={() => setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length)}
                className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Previous tab"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Tabs */}
              <div className="flex gap-1 flex-1">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`flex-1 px-2 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                      index === activeTab
                        ? 'bg-white text-black font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => setActiveTab((prev) => (prev + 1) % tabs.length)}
                className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                aria-label="Next tab"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Progress Display */}
          {selectedPlan && (
            <div className="flex-1 min-h-0 flex flex-col p-4">
              {/* Active Tab Content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 0 && (
                  /* Simple Dark Calendar */
                  <div className="bg-black rounded-2xl p-3 border border-gray-700">
                    {/* Header with navigation */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => {
                          let newMonth = calendarMonth - 1;
                          let newYear = calendarYear;
                          if (newMonth < 0) {
                            newMonth = 11;
                            newYear--;
                          }
                          setCalendarMonth(newMonth);
                          setCalendarYear(newYear);
                        }}
                        className="p-1 rounded-lg hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-white font-bold text-sm">
                        {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => {
                          let newMonth = calendarMonth + 1;
                          let newYear = calendarYear;
                          if (newMonth > 11) {
                            newMonth = 0;
                            newYear++;
                          }
                          setCalendarMonth(newMonth);
                          setCalendarYear(newYear);
                        }}
                        className="p-1 rounded-lg hover:bg-gray-700"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <div
                          key={idx}
                          className="text-center text-xs font-semibold text-gray-400"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Fade line indicator */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-1 rounded-full" />
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => (
                        <div
                          key={idx}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center text-xs font-semibold
                            ${!day.date 
                              ? 'invisible' 
                              : day.isToday 
                                ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                                : day.isInPlan 
                                  ? day.isPast 
                                    ? 'bg-purple-900 text-purple-300' 
                                    : 'bg-purple-800 text-purple-200' 
                                  : 'bg-gray-800 text-gray-500'
                            }
                          `}
                        >
                          {day.dayNum}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                /* Today's Focus */
                <div className="w-full h-full flex flex-col">
                  {/* Table */}
                  <div className="flex-1 min-h-0 overflow-y-auto border border-gray-700 rounded-lg">
                    {isTodayTableLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <table className="text-gray-300 text-xs sm:text-sm font-light w-full">
                        <tbody>
                          {todayTable.map((item, idx: number) => (
                            <tr key={idx} className="border-b border-gray-700 last:border-b-0">
                              <td className="p-3 align-middle">
                                <div className="flex flex-col gap-1">
                                  {item.category && (
                                    <span className="text-purple-400 text-xs font-semibold uppercase">
                                      {item.category}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-purple-500 flex items-center justify-center flex-shrink-0" />
                                    <span className="text-gray-200">{item.task}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

                {activeTab === 2 && (
                  /* Progress Analysis */
                  <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-700">
                    <h3 className="text-white font-bold text-base mb-3">
                      AI Progress Analysis
                    </h3>
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-2 py-6">
                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Analyzing your progress...</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-300 text-sm whitespace-pre-line">{analysis}</p>
                        <button
                          onClick={() => handleAnalyzeProgress(true)}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform text-sm"
                        >
                          Refresh Analysis
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Active Plan Message */}
          {plans.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-gray-500 text-5xl mb-4">📈</div>
              <p className="text-gray-400 text-lg mb-4">No plans yet!</p>
              <button
                onClick={() => router.push('/planner')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
              >
                Create Your First Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanProgressTrackerPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-40 h-6 rounded" />
        </div>
      </div>
    }>
      <PlanProgressContent />
    </Suspense>
  );
}
