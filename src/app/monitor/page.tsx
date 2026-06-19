'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BarChart } from '@/components/BarChart';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import ChatRow from '@/components/ChatRow';
import AIIcon from '@/components/AIIcon';
import FloatingNavBar from '@/components/FloatingNavBar';
import { getTheme, loadTheme } from '@/lib/theme';
import {
  parseWeightGoalFromPrompt,
  generateMockWeightKg,
  buildWeightKgFromEntries,
  toWeightChartHeights,
  type PlanEntryWithMetrics,
} from '@/lib/weightGoal';

// ─── helpers ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

function getPlanDay(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((today.getTime() - start.getTime()) / 86400000) + 1);
}

function getPlanTotalDays(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 45;
  const s = new Date(startDate);
  const e = new Date(endDate);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000));
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

interface Metric { type: string; value: number; unit?: string | null; }

// ─── main content ─────────────────────────────────────────────────────────────

function MonitorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Today's metrics from DB
  const [todayMetrics, setTodayMetrics] = useState<Metric[]>([]);

  // All entries for charts
  const [planEntries, setPlanEntries] = useState<PlanEntryWithMetrics[]>([]);

  // Live clock
  const [now, setNow] = useState(new Date());

  // Notes
  const [dailyNotes, setDailyNotes] = useState('');
  const [notesHistory, setNotesHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  // Adaptive border radius
  const [borderRadius, setBorderRadius] = useState('40px');

  // AI extraction
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  // Weight chart data
  const [weightsKg, setWeightsKg] = useState<number[]>([]);
  const [activityBarData, setActivityBarData] = useState<number[]>([]);

  // Theme
  const [currentTheme, setCurrentTheme] = useState('dark');
  const theme = getTheme(currentTheme);

  // ── bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setCurrentTheme(loadTheme());
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) { router.push('/'); return; }
    setUser(JSON.parse(userStr));

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, [router]);

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Adaptive border radius based on screen size
  useEffect(() => {
    const updateBorderRadius = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const minDimension = Math.min(vh, vw);
      
      // Calculate border radius as percentage of screen size
      // Smaller screens get proportionally smaller radius
      if (minDimension < 400) {
        setBorderRadius('20px');
      } else if (minDimension < 600) {
        setBorderRadius('30px');
      } else {
        setBorderRadius('40px');
      }
    };

    updateBorderRadius();
    window.addEventListener('resize', updateBorderRadius);
    return () => window.removeEventListener('resize', updateBorderRadius);
  }, []);

  // ── fetch plans ──────────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        const list: Plan[] = data.plans || [];
        setPlans(list);
        const planIdFromQuery = searchParams.get('planId');
        const target = planIdFromQuery
          ? list.find(p => p.id === planIdFromQuery)
          : list.find(p => p.status === 'IN_PROGRESS') ?? list[0] ?? null;
        setSelectedPlan(target ?? null);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [user?.email, searchParams]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // ── fetch today's entry + all entries when plan changes ──────────────────
  const fetchData = useCallback(async () => {
    if (!user?.email || !selectedPlan) return;

    // All entries for charts
    try {
      const url = new URL('/api/users/me/daily-entries', window.location.origin);
      url.searchParams.set('email', user.email);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const entries: PlanEntryWithMetrics[] = (data.dailyEntries || [])
          .filter((e: { planId: string }) => e.planId === selectedPlan.id)
          .map((e: { date: string; metrics?: PlanEntryWithMetrics['metrics']; notes?: string | null }) => ({
            date: e.date,
            metrics: e.metrics ?? [],
            notes: e.notes ?? null,
          }));
        setPlanEntries(entries);

        // Build weight chart
        const totalDays = getPlanTotalDays(selectedPlan.startDate, selectedPlan.endDate);
        const goal = parseWeightGoalFromPrompt(selectedPlan.prompt);
        const realWeights = buildWeightKgFromEntries(entries, selectedPlan.startDate ?? '', totalDays);
        setWeightsKg(realWeights ?? generateMockWeightKg(totalDays, goal, selectedPlan.id));

        // Build activity bar (distance per logged day, or 0)
        const distanceByDay: number[] = Array(totalDays).fill(0);
        if (selectedPlan.startDate) {
          const start = new Date(selectedPlan.startDate);
          start.setHours(0, 0, 0, 0);
          for (const entry of entries) {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            const idx = Math.round((d.getTime() - start.getTime()) / 86400000);
            const dist = entry.metrics.find(m => m.type === 'distance');
            if (dist && idx >= 0 && idx < totalDays) {
              distanceByDay[idx] = Math.min(100, (dist.value / 15) * 100); // normalise to 0-100 (15km max)
            }
          }
        }
        setActivityBarData(distanceByDay);
      }
    } catch (e) { console.error(e); }

    // Today's entry for live metrics
    try {
      const url = new URL(
        `/api/users/me/daily-entries/${encodeURIComponent(getTodayStr())}`,
        window.location.origin
      );
      url.searchParams.set('email', user.email);
      url.searchParams.set('planId', selectedPlan.id);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setTodayMetrics(data.dailyEntry?.metrics ?? []);
        setDailyNotes(data.dailyEntry?.notes ?? '');
      } else {
        setTodayMetrics([]);
        setDailyNotes('');
      }
    } catch (e) { console.error(e); }
  }, [user?.email, selectedPlan]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── auto-save notes ──────────────────────────────────────────────────────
  // Notes are now ephemeral - handled in AI modal

  // ── AI metric extraction ─────────────────────────────────────────────────
  const handleSendToAI = async () => {
    if (!user?.email || !selectedPlan || !notesInput.trim()) return;
    
    // Add user message to history
    const userMessage = notesInput.trim();
    setNotesHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Clear input immediately (like chat UX)
    setNotesInput('');
    
    setIsExtracting(true);
    setExtractionResult('');
    setChatMessages([]);
    
    try {
      setChatMessages(['🤖 Analyzing your activity notes...']);
      
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('prompt', userMessage);
      formData.append('planId', selectedPlan.id);

      const res = await fetch(
        `/api/users/me/daily-entries/${encodeURIComponent(getTodayStr())}/analyze`,
        { method: 'POST', body: formData }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatMessages(prev => [...prev, '📊 Extracted metrics from your notes']);
          
          // Show what was extracted
          const changes = data.metricChanges || [];
          let responseText = '';
          if (changes.length > 0) {
            setChatMessages(prev => [...prev, '✏️ Updated metrics:']);
            changes.forEach((c: { type: string; action: string; newValue: number; newUnit?: string }) => {
              const msg = `  • ${c.type}: ${c.newValue}${c.newUnit ? ' ' + c.newUnit : ''}`;
              setChatMessages(prev => [...prev, msg]);
              responseText += msg + '\n';
            });
          } else {
            setChatMessages(prev => [...prev, '❌ No metrics found in notes']);
            responseText = 'No metrics found in your notes.';
          }
          
          setChatMessages(prev => [...prev, '📋 Saved to today\'s entry']);
          
          // Add assistant response to history
          setNotesHistory(prev => [...prev, { role: 'assistant', content: responseText || 'Metrics updated successfully.' }]);
          
          // Refresh metrics display
          await fetchData();
          
          setChatMessages(prev => [...prev, '✅ All done! Metrics updated.']);
          setExtractionResult('success');
        } else {
          const errorMsg = 'Failed to extract metrics from your notes.';
          setChatMessages(prev => [...prev, '❌ ' + errorMsg]);
          setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
          setExtractionResult('error');
        }
      } else {
        const errorMsg = 'Network error occurred.';
        setChatMessages(prev => [...prev, '❌ ' + errorMsg]);
        setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        setExtractionResult('error');
      }
    } catch (e) {
      console.error(e);
      const errorMsg = 'Network error occurred.';
      setChatMessages(prev => [...prev, '❌ ' + errorMsg]);
      setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      setExtractionResult('error');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── derived values ────────────────────────────────────────────────────────
  const planDay = getPlanDay(selectedPlan?.startDate ?? null);
  const totalDays = getPlanTotalDays(selectedPlan?.startDate ?? null, selectedPlan?.endDate ?? null);

  const getMetric = (type: string) => todayMetrics.find(m => m.type === type);
  const distance = getMetric('distance');
  const pace = getMetric('pace');
  const totalTime = getMetric('totalTime');
  const weight = getMetric('weight');

  // Most recent value across all entries (fallback when today has nothing)
  const getLatestMetric = (type: string) => {
    for (const entry of [...planEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
      const m = entry.metrics.find(m => m.type === type);
      if (m) return m;
    }
    return null;
  };

  const displayDistance = distance ?? getLatestMetric('distance');
  const displayPace = pace ?? getLatestMetric('pace');
  const displayTime = totalTime ?? getLatestMetric('totalTime');

  // Weight chart heights
  const weightBarHeights = toWeightChartHeights(weightsKg);
  const weightGoal = parseWeightGoalFromPrompt(selectedPlan?.prompt ?? '');

  // Clock
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  const ampm = now.getHours() < 12 ? 'AM' : 'PM';
  const time12 = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const [clockTime, clockAmPm] = time12.split(' ');

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div className="w-full h-screen flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: theme.colors.background }}>
      <div
        className="overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{ 
          width: `min(95vw, ${baseWidth}px)`, 
          aspectRatio: baseWidth / baseHeight, 
          maxHeight: '95vh',
          borderRadius: borderRadius,
          backgroundColor: theme.colors.card
        }}
      >
        <div className="w-full h-full flex flex-col relative">
          {/* Header Row 1 — burger menu + Synapse logo + brand name */}
          <div className="flex w-full h-[6%] relative items-center">
            {/* Burger menu */}
            <div className="absolute top-3 left-3 z-20">
              <BurgerMenuButton />
            </div>

            {/* Synapse Brand Name */}
            <div className="w-full h-full flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-32 h-8" />
              ) : (
                <span 
                  className="text-xl sm:text-2xl font-bold tracking-wider" 
                  style={{ 
                    color: theme.colors.text,
                    fontFamily: 'var(--font-hanalei-fill)'
                  }}
                >
                  SYNAPSE
                </span>
              )}
            </div>
          </div>

          {/* Header Row 2 — date + plan selector */}
          <div className="flex w-full h-[6%] relative">
            {/* Date display */}
            <div className="w-1/2 h-full flex items-center justify-center px-3">
              {isLoading ? (
                <Skeleton className="w-24 h-6" />
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-light tabular-nums" style={{ color: theme.colors.text }}>
                  {now.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Plan selector */}
            <div className="w-1/2 h-full flex items-center justify-center px-3">
              {isLoading ? (
                <Skeleton className="w-28 h-6" />
              ) : (
                <select
                  value={selectedPlan?.id ?? ''}
                  onChange={e => {
                    const p = plans.find(p => p.id === e.target.value);
                    setSelectedPlan(p ?? null);
                  }}
                  className="bg-transparent text-sm sm:text-base font-light border-none outline-none text-center w-full truncate cursor-pointer"
                  style={{ color: theme.colors.text }}
                >
                  {plans.length === 0
                    ? <option value="">No Plans</option>
                    : plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                  }
                </select>
              )}
            </div>
          </div>

          {/* Row 3 — ACTIVITY + day counter */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border flex items-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-24 h-6" /> : (
                <span className="text-xl sm:text-2xl font-light" style={{ color: theme.colors.text }}>ACTIVITY</span>
              )}
            </div>
            <div className="w-1/2 h-full border flex items-center justify-center" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-28 h-8" /> : (
                <span className="font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', lineHeight: 1, color: theme.colors.text }}>
                  DAY {planDay}
                </span>
              )}
            </div>
          </div>

          {/* Row 3 — Distance */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border flex items-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-16 h-4" /> : (
                <span className="text-base font-light" style={{ color: theme.colors.text }}>Distance</span>
              )}
            </div>
            <div className="w-1/2 h-full border flex items-center justify-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayDistance
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: theme.colors.text }}>{displayDistance.value}</span>
                      <span className="text-xs ml-1" style={{ color: theme.colors.textSecondary }}>{displayDistance.unit ?? 'km'}</span>
                      {!distance && <span className="text-[8px] ml-1" style={{ color: theme.colors.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: theme.colors.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 4 — Pace */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border flex items-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-12 h-4" /> : (
                <span className="text-base font-light" style={{ color: theme.colors.text }}>Pace</span>
              )}
            </div>
            <div className="w-1/2 h-full border flex items-center justify-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayPace
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: theme.colors.text }}>
                        {displayPace.unit?.includes('second') ? formatPace(displayPace.value) : displayPace.value}
                      </span>
                      <span className="text-xs ml-1" style={{ color: theme.colors.textSecondary }}>/km</span>
                      {!pace && <span className="text-[8px] ml-1" style={{ color: theme.colors.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: theme.colors.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 5 — Total Time */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border flex items-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-20 h-4" /> : (
                <span className="text-base font-light" style={{ color: theme.colors.text }}>Total Time</span>
              )}
            </div>
            <div className="w-1/2 h-full border flex items-center justify-center px-3" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayTime
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: theme.colors.text }}>
                        {displayTime.unit?.includes('second') ? formatSeconds(Math.round(displayTime.value)) : displayTime.value}
                      </span>
                      {!totalTime && <span className="text-[8px] ml-1" style={{ color: theme.colors.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: theme.colors.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 6 — Charts */}
          <div className="flex w-full h-[12.93%]">
            {/* Activity bar chart (distance per day) */}
            <div className="w-1/2 h-full border flex flex-col p-2 overflow-hidden" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] mb-1" style={{ color: theme.colors.textSecondary }}>
                    <span>Day 1</span>
                    <span className="text-[#E63416]">DIST</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1">
                    <BarChart
                      data={activityBarData}
                      color="#E63416"
                      activeBarCount={planDay}
                      inactiveColor="#444"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Weight chart */}
            <div className="w-1/2 h-full border flex flex-col p-2 relative overflow-hidden" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] mb-1" style={{ color: theme.colors.textSecondary }}>
                    <span>Day 1</span>
                    <span style={{ color: theme.colors.primary }}>WEIGHT</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1 relative">
                    <BarChart
                      data={weightBarHeights}
                      color={theme.colors.primary}
                      showConnectingLine
                      connectingLineColor={theme.colors.text}
                      connectingLineWidth={1}
                      connectingLineShadow="#EFE9E9"
                      activeBarCount={planDay}
                      inactiveColor="#666666"
                      showCurrentDayArrow
                      currentDayArrowColor={theme.colors.text}
                    />
                    <div className="absolute bottom-0 left-1">
                      <span className="text-sm font-light" style={{ color: theme.colors.text }}>
                        {weight
                          ? `${weight.value}kg`
                          : weightsKg.length > 0
                            ? `${weightsKg[Math.min(planDay - 1, weightsKg.length - 1)]?.toFixed(1)}kg`
                            : weightGoal.currentWeight
                              ? `${weightGoal.currentWeight}kg`
                              : '—'
                        }
                      </span>
                    </div>
                    {weightGoal.goalWeight && (
                      <div className="absolute bottom-0 right-1 text-[9px]" style={{ color: theme.colors.textSecondary }}>
                        →{weightGoal.goalWeight}kg
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 7 — Live clock */}
          <div className="flex w-full h-[17.85%]">
            <div className="w-[28.36%] h-full border flex items-center justify-center" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-12 h-8" /> : (
                <span className="text-3xl sm:text-4xl font-light" style={{ color: theme.colors.text }}>{dayName}</span>
              )}
            </div>
            <div className="w-[71.64%] h-full border flex items-center justify-center gap-2" style={{ borderColor: theme.colors.border }}>
              {isLoading ? <Skeleton className="w-32 h-16" /> : (
                <>
                  <span className="text-5xl sm:text-6xl font-light tabular-nums" style={{ color: theme.colors.text }}>{clockTime}</span>
                  <span className="text-xl sm:text-2xl" style={{ color: theme.colors.textSecondary }}>{clockAmPm}</span>
                </>
              )}
            </div>
          </div>

          {/* Row 8 — progress bar strip */}
          <div className="w-full h-[5.26%] border flex items-center px-3 gap-1" style={{ borderColor: theme.colors.border }}>
            {isLoading ? <Skeleton className="w-full h-3 rounded-full" /> : (
              <>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderAlt }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (planDay / totalDays) * 100)}%`, backgroundColor: theme.colors.primary }}
                  />
                </div>
                <span className="text-[9px] whitespace-nowrap flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                  {planDay}/{totalDays}d
                </span>
              </>
            )}
          </div>

          {/* Row 9 — Smart Insights & Recommendations */}
          <div className="w-full flex-1 border flex flex-col p-3 overflow-y-auto" style={{ borderColor: theme.colors.border }}>
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold tracking-wider" style={{ color: theme.colors.primary }}>
                    INSIGHTS & TIPS
                  </h4>
                  <span className="text-[9px]" style={{ color: theme.colors.textMuted }}>
                    AI Analysis
                  </span>
                </div>
                
                {/* Smart analysis based on actual data */}
                {(() => {
                  const last7Days = planEntries.slice(-7);
                  const activeDays = last7Days.filter(entry => 
                    entry.metrics.some(m => m.type === 'distance' && m.value > 0)
                  ).length;
                  const totalDistance = last7Days.reduce((sum, entry) => {
                    const dist = entry.metrics.find(m => m.type === 'distance');
                    return sum + (dist?.value || 0);
                  }, 0);
                  const progressPercent = Math.round((planDay / totalDays) * 100);
                  
                  // Smart insights
                  let motivation = '';
                  let analysis = '';
                  let recommendation = '';
                  
                  if (activeDays === 0) {
                    motivation = '🚀 Ready to start strong?';
                    analysis = 'No activities logged this week yet. Every journey begins with a single step!';
                    recommendation = 'Tip: Start with a light 3-5km run today to build momentum.';
                  } else if (activeDays >= 5) {
                    motivation = '🔥 Outstanding consistency!';
                    analysis = `${activeDays} active days this week! You are building an incredible routine.`;
                    recommendation = 'Keep this momentum while ensuring proper recovery days.';
                  } else if (activeDays >= 3) {
                    motivation = '💪 Strong effort this week!';
                    analysis = `${activeDays} workouts completed. You are on the right track!`;
                    recommendation = 'Try adding one more session this week for even better results.';
                  } else {
                    motivation = '🎯 Time to level up!';
                    analysis = `${activeDays} ${activeDays === 1 ? 'session' : 'sessions'} so far. There is room to push harder!`;
                    recommendation = 'Aim for 3-4 sessions next week for optimal progress.';
                  }
                  
                  // Progress-based insights
                  if (progressPercent >= 75) {
                    motivation = '🏆 Final stretch ahead!';
                    analysis = `You are ${progressPercent}% through your plan. The finish line is in sight!`;
                    recommendation = 'Stay focused and maintain your routine to finish strong.';
                  } else if (progressPercent >= 50) {
                    motivation = '⚡ Halfway there!';
                    analysis = `${progressPercent}% complete! You have built solid momentum.`;
                    recommendation = 'This is where habits become permanent. Keep going!';
                  }
                  
                  // Weight goal insights
                  if (weightGoal.goalWeight && weight) {
                    const diff = weight.value - weightGoal.goalWeight;
                    if (Math.abs(diff) <= 2) {
                      motivation = '🎉 Almost at goal weight!';
                      analysis = `Just ${Math.abs(diff).toFixed(1)}kg away from your target!`;
                      recommendation = 'Maintain consistency - you are so close!';
                    }
                  }
                  
                  return (
                    <div className="flex-1 space-y-3 text-xs" style={{ color: theme.colors.text }}>
                      <div className="leading-relaxed">
                        <p className="font-bold mb-1" style={{ color: theme.colors.primary }}>
                          {motivation}
                        </p>
                        <p style={{ color: theme.colors.textSecondary }}>
                          {analysis}
                        </p>
                      </div>
                      
                      <div className="leading-relaxed pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                        <p className="font-medium mb-1" style={{ color: theme.colors.text }}>
                          💡 Recommendation
                        </p>
                        <p style={{ color: theme.colors.textSecondary }}>
                          {recommendation}
                        </p>
                      </div>
                      
                      {totalDistance > 0 && (
                        <div className="leading-relaxed pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                          <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>
                            Weekly total: {totalDistance.toFixed(1)}km across {activeDays} {activeDays === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Glass Overlay Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
              <h3 className="text-lg font-semibold" style={{ color: currentTheme === 'light' ? '#000000' : theme.colors.text }}>
                Activity Logger
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: theme.colors.cardAlt, color: currentTheme === 'light' ? '#000000' : theme.colors.text }}
              >
                ✕
              </button>
            </div>

            {/* Live ChatRow for processing */}
            <ChatRow 
              targetHeight={chatMessages.length > 0 ? '160px' : '0px'}
              chatMessages={chatMessages}
              textColor={currentTheme === 'light' ? '#000000' : '#FFFFFF'}
              isDarkMode={currentTheme === 'dark'}
            />

            {/* Input Area */}
            <div className="p-4">
              <textarea
                className="w-full rounded-lg border p-3 text-sm resize-none outline-none mb-3"
                style={{ 
                  backgroundColor: theme.colors.cardAlt,
                  color: currentTheme === 'light' ? '#000000' : theme.colors.text,
                  borderColor: theme.colors.border,
                  minHeight: '140px'
                }}
                placeholder="Log your activities and I'll extract the metrics for you&#10;&#10;e.g., Ran 8km in 40min, pace 5:00/km, weight 72.5kg"
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendToAI();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: currentTheme === 'light' ? '#666666' : theme.colors.textMuted }}>
                  Press Enter to send
                </span>
                <div style={{ width: '120px', height: '32px' }}>
                  <CustomButton
                    text={isExtracting ? "ANALYZING..." : "SEND"}
                    onClick={handleSendToAI}
                    fontSize="11px"
                    width="120px"
                    mirror={true}
                    color={currentTheme === 'light' ? '#000000' : undefined}
                    lightMode={currentTheme === 'light'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Navigation Bar */}
      <FloatingNavBar onAIClick={() => setShowAIModal(true)} />
    </div>
  );
}

export default function MonitorPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    }>
      <MonitorContent />
    </Suspense>
  );
}
