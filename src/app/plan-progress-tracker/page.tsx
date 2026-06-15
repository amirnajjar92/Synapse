'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAnalysePlanProgress } from '@/lib/hooks/useAnalysePlanProgress';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import { ProgressComparisonChart } from '@/components/ProgressComparisonChart';
import { WeightChart } from '@/components/WeightChart';
import {
  parseWeightGoalFromPrompt,
  generateMockWeightKg,
  buildWeightKgFromEntries,
  type WeightGoalInfo,
} from '@/lib/weightGoal';
import AIIcon from '@/components/AIIcon';
import CustomButton from '@/components/CustomButton';
import ChatRow from '@/components/ChatRow';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: Array<{
    id?: string | number;
    title: string;
    rows: Array<{
      id?: string | number;
      columns: string[];
    }>;
  }>;
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

interface DailyEntryWithMetrics {
  date: string;
  planId: string;
  metrics: Array<{ type: string; value: number }>;
}

function getPlanTotalDays(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 45;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#3B3B3B] via-black to-[#3B3B3B] bg-[length:200%_100%] opacity-50 ${className}`} />
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
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  // Get today's day name (e.g., "Monday")
  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  const todayDayName = getTodayDayName();

  // Icon map for categories
  const iconMap: { [key: string]: React.ReactNode } = {
    'CARDIO': <img src="/vectors/cardio-icon.svg" alt="Cardio" className="w-12 h-12 object-contain" />,
    'MEALS': <img src="/vectors/meals-icon.svg" alt="Meals" className="w-12 h-12 object-contain" />,
    'SUPPLEMENTS': <img src="/vectors/suppliments-icon.svg" alt="Supplements" className="w-12 h-12 object-contain" />,
    'NUTRIENTS': <img src="/vectors/nutrients-icon.svg" alt="Nutrients" className="w-12 h-12 object-contain" />,
    'CHALLENGES': <img src="/vectors/challenges-icon.svg" alt="Challenges" className="w-12 h-12 object-contain" />,
    'RECOMMENDED': <img src="/vectors/recomended-icon.svg" alt="Recommended" className="w-12 h-12 object-contain" />
  };

  // Toggle section open/close
  const toggleSection = (category: string) => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCurrentDay = useCallback(() => {
    if (!selectedPlan?.startDate) return 0;
    const start = new Date(selectedPlan.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [selectedPlan?.startDate]);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Calendar' },
    { label: "Today's Focus" },
    { label: 'Analyser', icon: '/vectors/ai-icon.svg' },
  ];

  // AI Modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzingEntry, setIsAnalyzingEntry] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [weightsKg, setWeightsKg] = useState<number[]>([]);
  const [weightGoal, setWeightGoal] = useState<WeightGoalInfo>({
    mode: 'regularweighttracker',
  });

  // Check authentication and get user
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      const newUser = JSON.parse(userStr);
      setUser(prevUser => {
        if (JSON.stringify(prevUser) === JSON.stringify(newUser)) {
          return prevUser;
        }
        return newUser;
      });
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

  const getTotalDays = () => getPlanTotalDays(selectedPlan?.startDate ?? null, selectedPlan?.endDate ?? null);

  const fetchWeightData = useCallback(async () => {
    if (!selectedPlan || !user?.email) return;

    const goal = parseWeightGoalFromPrompt(selectedPlan.prompt);
    setWeightGoal(goal);

    const totalDays =
      selectedPlan.startDate && selectedPlan.endDate
        ? getPlanTotalDays(selectedPlan.startDate, selectedPlan.endDate)
        : 45;

    const applyMock = () =>
      setWeightsKg(generateMockWeightKg(totalDays, goal, selectedPlan.id));

    if (!selectedPlan.startDate) {
      applyMock();
      return;
    }

    try {
      const url = new URL('/api/users/me/daily-entries', window.location.origin);
      url.searchParams.set('email', user.email);
      const response = await fetch(url.toString());

      if (!response.ok) {
        applyMock();
        return;
      }

      const data = await response.json();
      const planEntries = (data.dailyEntries || []).filter(
        (entry: DailyEntryWithMetrics) => entry.planId === selectedPlan.id
      );
      const realData = buildWeightKgFromEntries(
        planEntries,
        selectedPlan.startDate,
        totalDays
      );

      setWeightsKg(
        realData ?? generateMockWeightKg(totalDays, goal, selectedPlan.id)
      );
    } catch (error) {
      console.error('Error fetching weight data:', error);
      applyMock();
    }
  }, [selectedPlan, user?.email]);

  useEffect(() => {
    fetchWeightData();
  }, [fetchWeightData]);

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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle AI analysis submission
  const handleAnalyzeEntry = async () => {
    if (!user?.email || !selectedPlan) return;
    
    setIsAnalyzingEntry(true);
    setChatMessages([]); // Clear previous messages
    
    try {
      setChatMessages(prev => [...prev, 'Starting analysis...']);
      
      const formData = new FormData();
      formData.append('prompt', aiPrompt);
      formData.append('email', user.email);
      
      // Add all uploaded files
      uploadedFiles.forEach(file => {
        formData.append('image', file);
      });
      
      setChatMessages(prev => [...prev, 'Sending data to AI...']);

      const response = await fetch(`/api/users/me/daily-entries/${encodeURIComponent(getTodayDateStr())}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setChatMessages(prev => [...prev, 'AI is analyzing your activity...']);
        
        const data = await response.json();
        
        setChatMessages(prev => [...prev, 'Extracting metrics...']);
        
        // Simulate processing steps
        await new Promise(r => setTimeout(r, 500));
        
        setChatMessages(prev => [...prev, 'Saving your daily entry to the database...']);
        
        await new Promise(r => setTimeout(r, 500));
        
        // Show extracted data in chat
        if (data.extractedData) {
          setChatMessages(prev => [...prev, '📊 Here\'s the data I extracted from your entry:']);
          Object.entries(data.extractedData).forEach(([key, value]: [string, any]) => {
            setChatMessages(prev => [...prev, `  • ${key}: ${value.value} ${value.unit || ''}`]);
          });
        }
        
        setChatMessages(prev => [...prev, '✅ Done! Your entry has been saved successfully!']);
        
        // Refresh weight chart with any newly saved metrics
        fetchWeightData();
        fetchTodayEntry();
      } else {
        setChatMessages(prev => [...prev, '❌ Error: Failed to analyze entry']);
      }
    } catch (error) {
      console.error('Error analyzing entry:', error);
      setChatMessages(prev => [...prev, '❌ Error: Something went wrong']);
    } finally {
      setIsAnalyzingEntry(false);
    }
  };

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
          <div className="p-4 border-b border-[#3B3B3B]">
            <div className="flex items-center gap-4">
              <BurgerMenuButton />
              <h1
                className="text-white font-bold flex-1 min-w-0"
                style={{
                  fontFamily: 'var(--font-hanalei-fill)',
                  fontSize: '1.5rem'
                }}
              >
                Plan Progress
              </h1>
            </div>
          </div>

          {/* Current Date & Day */}
          {selectedPlan && (
            <div className="flex w-full border-b border-[#3B3B3B]">
              {/* Left Cell: Day Name + Date (stacked) */}
              <div className="w-1/2 h-full border-r border-[#3B3B3B] flex flex-col items-center justify-center p-4 ">
                <span 
                  className="text-white font-bold" 
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: '2rem'
                  }}
                >
                  {todayDayName.toUpperCase()}
                </span>
                <span 
                  className="text-white font-medium" 
                  style={{ 
                    fontFamily: 'var(--font-hanalei-fill)', 
                    fontSize: '1rem'
                  }}
                >
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {/* Right Cell: Day Counter */}
              <div className="w-1/2 h-full flex items-center justify-center p-4">
                <div className="flex items-baseline gap-1">
                  <span 
                    className="text-white font-bold"
                    style={{
                      fontFamily: 'var(--font-hanalei-fill)',
                      fontSize: '2rem'
                    }}
                  >
                    DAY{getCurrentDay()}
                  </span>
                  <span 
                    className="text-[#FFFFFF50]"
                    style={{
                      fontFamily: 'var(--font-hanalei-fill)',
                      fontSize: '1.25rem'
                    }}
                  >
                    /{getTotalDays()}DAYS
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs with Prev/Next */}
          {selectedPlan && (
            <div className="flex items-center justify-between p-2 ">
              {/* Previous button */}
              <button
                onClick={() => setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length)}
                className="p-2 text-white hover:bg-[#3B3B3B] rounded-full transition-colors flex-shrink-0"
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
                    className={`flex-1 px-2 py-1.5 rounded-full text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                      index === activeTab
                        ? 'bg-white text-black font-semibold'
                        : 'bg-[#3B3B3B] text-white hover:bg-[#3B63CF]'
                    }`}
                  >
                    {tab.icon && (
                      <img
                        src={tab.icon}
                        alt=""
                        className={`w-3 h-3 object-contain flex-shrink-0 ${
                          index === activeTab ? 'brightness-0' : ''
                        }`}
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => setActiveTab((prev) => (prev + 1) % tabs.length)}
                className="p-2 text-white hover:bg-[#3B3B3B] rounded-full transition-colors flex-shrink-0"
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
                  <div className="flex flex-col gap-4">
                    <div className="bg-black rounded-2xl p-3 border border-[#3B3B3B00]">
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
                          className="p-1 rounded-lg hover:bg-[#3B3B3B]"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="p-1 rounded-lg hover:bg-[#3B3B3B]"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                          <div
                            key={idx}
                            className="text-center text-xs font-semibold text-white"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Fade line indicator */}
                      <div className="h-1 bg-gradient-to-r from-transparent via-[#3B63CF] to-transparent mb-1 rounded-full" />
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => (
                          <div
                            key={idx}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center text-xs font-semibold
                              ${!day.date 
                                ? 'invisible' 
                                : day.isToday 
                                  ? 'bg-[#3B63CF] text-white' 
                                  : day.isInPlan 
                                    ? 'bg-[#3B3B3B] text-white' 
                                    : 'bg-black text-[#3B3B3B]'
                              }
                            `}
                          >
                            {day.dayNum}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  /* Today's Focus */
                  <div className="w-full h-full flex flex-col">
                    {/* Header with refresh button */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h2
                          className="text-white font-bold"
                          style={{
                            fontFamily: 'var(--font-hanalei-fill)',
                            fontSize: '2.5rem'
                          }}
                        >
                          TODAY
                        </h2>
                        <div className="w-px h-8 bg-[#3B3B3B]" />
                        <p className="text-white text-sm">
                          This is your today plan. Goodluck Baby
                        </p>
                      </div>
                    </div>

                    {/* Sections */}
                    {!selectedPlan || selectedPlan.tables.length === 0 ? (
                      <div className="text-center text-white py-8">
                        No plan data available
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
                        {selectedPlan.tables
                          .sort((a, b) => {
                            if (a.title.toUpperCase() === 'CARDIO') return -1;
                            if (b.title.toUpperCase() === 'CARDIO') return 1;
                            return 0;
                          })
                          .map((table, index) => {
                          const isOpen = openSections[table.title] ?? true; // Default open
                          const categoryUpper = table.title.toUpperCase();
                          
                          // Filter rows for cardio table to only show today's day
                          const filteredRows = categoryUpper === 'CARDIO' 
                            ? table.rows.filter(row => 
                                row.columns[0]?.toLowerCase().includes(todayDayName.toLowerCase())
                              )
                            : table.rows;
                          
                          return (
                            <div key={index} className="border-b border-[#3B3B3B]">
                              {/* Section Header */}
                              <button
                                onClick={() => toggleSection(table.title)}
                                className="w-full flex items-center gap-4 py-4 text-left"
                              >
                                {/* Category Title and Icon */}
                                <div className="flex items-center gap-4 flex-1">
                                  <h3
                                    className="text-white font-bold"
                                    style={{
                                      fontFamily: 'var(--font-hanalei-fill)',
                                      fontSize: '1.75rem'
                                    }}
                                  >
                                    {categoryUpper}
                                  </h3>
                                  {iconMap[categoryUpper]}
                                </div>
                                {/* Chevron Icon */}
                                <svg
                                  className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {/* Section Content */}
                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
                              >
                                <div className="overflow-x-auto">
                                  <table className="text-white text-xs sm:text-sm font-light min-w-max">
                                    <tbody>
                                      {filteredRows.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-[#3B3B3B] last:border-b-0">
                                          {row.columns.map((cell, colIndex) => (
                                            <td key={colIndex} className="p-3 align-middle">
                                              {cell}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 2 && (
                  /* Analyser */
                  <div className="flex flex-col gap-4">
                    {/* Progress Comparison Chart */}
                    {selectedPlan.startDate && selectedPlan.endDate && (
                      <ProgressComparisonChart
                        totalDays={getTotalDays()}
                        currentDay={getCurrentDay()}
                      />
                    )}

                    {/* Weight Chart */}
                    <WeightChart
                      mode={weightGoal.mode}
                      goalWeight={weightGoal.goalWeight}
                      weightsKg={
                        weightsKg.length > 0
                          ? weightsKg
                          : generateMockWeightKg(
                              getTotalDays() || 45,
                              weightGoal,
                              selectedPlan.id
                            )
                      }
                      totalDays={getTotalDays() || 45}
                      currentDay={Math.max(getCurrentDay(), 1)}
                    />

                    <div className="rounded-2xl p-4 border border-[#3B3B3B00]">
                      <h3 className="text-white font-bold text-base mb-3">
                        AI Progress Analysis
                      </h3>
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-2 py-6">
                          <div className="w-8 h-8 border-3 border-[#3B63CF] border-t-transparent rounded-full animate-spin" />
                          <p className="text-white text-sm">Analyzing your progress...</p>
                        </div>
                      ) : (
                        <p className="text-white text-sm whitespace-pre-line">{analysis}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Active Plan Message */}
          {plans.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-[#3B3B3B] text-5xl mb-4">📈</div>
              <p className="text-white text-lg mb-4">No plans yet!</p>
              <button
                onClick={() => router.push('/planner')}
                className="px-6 py-3 bg-[#3B63CF] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Create Your First Plan
              </button>
            </div>
          )}
        </div>

        {/* Floating AI Button */}
        {selectedPlan && (
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-[#3B63CF] rounded-full flex items-center justify-center shadow-xl z-50 hover:scale-110 transition-transform"
          >
            <AIIcon />
          </button>
        )}

        {/* Glass Overlay Modal */}
        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0b0b0b] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-[#3B3B3B]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#3B3B3B]">
                <h3
                  className="text-white font-bold"
                  style={{
                    fontFamily: 'var(--font-hanalei-fill)',
                    fontSize: '1.5rem'
                  }}
                >
                  DAILY ACTIVITY
                </h3>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-2 hover:bg-[#3B3B3B] rounded-full"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ChatRow */}
              <ChatRow 
                targetHeight={chatMessages.length > 0 ? "200px" : "0%"} 
                chatMessages={chatMessages} 
              />
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-[#3B3B3B] rounded-lg flex items-center justify-center text-white text-xs">
                            {file.name.slice(0, 10)}
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Area */}
                <textarea
                  className="w-full h-40 bg-black text-white p-3 rounded-xl border border-[#3B3B3B] resize-none focus:outline-none focus:border-[#3B63CF]"
                  placeholder="Describe your daily activity here...
Example:
Distance: 6.34/km
Pace: 08:07/km
Total Time: 1:05:37
Weight: 74.8kg"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#3B3B3B] space-y-3">
                {/* Action Buttons */}
                <div className="flex gap-3 items-center">
                  {/* Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-[#3B3B3B] rounded-full flex items-center justify-center hover:bg-[#4A4A4A] transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setIsAIModalOpen(false);
                      setAiPrompt('');
                      setUploadedFiles([]);
                      setChatMessages([]);
                    }}
                    className="px-4 py-3 bg-[#3B3B3B] text-white rounded-xl font-semibold hover:bg-[#4A4A4A] transition-colors"
                  >
                    Close
                  </button>

                  {/* Analyze Button */}
                  <div className="flex-1">
                    <CustomButton
                      text="Analyze"
                      isLoading={isAnalyzingEntry}
                      onClick={handleAnalyzeEntry}
                      fontSize="calc((100vh * 0.95 * 0.0595) * 0.8)"
                      mirror={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
