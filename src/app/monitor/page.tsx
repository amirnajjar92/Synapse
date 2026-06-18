'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BarChart } from '@/components/BarChart';
import BurgerMenuButton from '@/components/BurgerMenuButton';
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
  const saveNotesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Weight chart data
  const [weightsKg, setWeightsKg] = useState<number[]>([]);
  const [activityBarData, setActivityBarData] = useState<number[]>([]);

  // ── bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) { router.push('/'); return; }
    setUser(JSON.parse(userStr));
  }, [router]);

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
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
        setActivityBarData(distanceByDay.length > 0 ? distanceByDay : Array(totalDays).fill(0));
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
  const handleNotesChange = (val: string) => {
    setDailyNotes(val);
    if (saveNotesTimer.current) clearTimeout(saveNotesTimer.current);
    saveNotesTimer.current = setTimeout(async () => {
      if (!user?.email || !selectedPlan) return;
      try {
        await fetch('/api/users/me/daily-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            planId: selectedPlan.id,
            date: getTodayStr(),
            notes: val,
          }),
        });
      } catch (e) { console.error(e); }
    }, 1000);
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
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{ width: `min(95vw, ${baseWidth}px)`, aspectRatio: baseWidth / baseHeight, maxHeight: '95vh' }}
      >
        <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: '#2C2C2C' }}>
          <div className="absolute top-4 left-4 z-10"><BurgerMenuButton /></div>

          {/* Row 1 — plan selector + date */}
          <div className="flex w-full h-[17.51%]">
            <div className="w-1/2 h-full flex items-center justify-center px-2">
              {isLoading ? <Skeleton className="w-28 h-8" /> : (
                <select
                  value={selectedPlan?.id ?? ''}
                  onChange={e => {
                    const p = plans.find(p => p.id === e.target.value);
                    setSelectedPlan(p ?? null);
                  }}
                  className="bg-transparent text-white text-lg font-light border-none outline-none text-center w-full truncate"
                >
                  {plans.length === 0
                    ? <option value="">No Plans</option>
                    : plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                  }
                </select>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Skeleton className="w-24 h-10" /> : (
                <span className="text-white text-3xl sm:text-4xl font-light">
                  {now.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Row 2 — ACTIVITY + day counter */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-3">
              {isLoading ? <Skeleton className="w-24 h-6" /> : (
                <span className="text-white text-xl sm:text-2xl font-light">ACTIVITY</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? <Skeleton className="w-28 h-8" /> : (
                <span className="text-white font-bold"
                  style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', lineHeight: 1 }}>
                  DAY {planDay}
                </span>
              )}
            </div>
          </div>

          {/* Row 3 — Distance */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-3">
              {isLoading ? <Skeleton className="w-16 h-4" /> : (
                <span className="text-white text-base font-light">Distance</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-3">
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayDistance
                  ? <div className="text-center w-full">
                      <span className="text-white text-xl font-light">{displayDistance.value}</span>
                      <span className="text-gray-400 text-xs ml-1">{displayDistance.unit ?? 'km'}</span>
                      {!distance && <span className="text-gray-600 text-[8px] ml-1">last</span>}
                    </div>
                  : <span className="text-gray-600 text-sm">—</span>
              )}
            </div>
          </div>

          {/* Row 4 — Pace */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-3">
              {isLoading ? <Skeleton className="w-12 h-4" /> : (
                <span className="text-white text-base font-light">Pace</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-3">
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayPace
                  ? <div className="text-center w-full">
                      <span className="text-white text-xl font-light">
                        {displayPace.unit?.includes('second') ? formatPace(displayPace.value) : displayPace.value}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">/km</span>
                      {!pace && <span className="text-gray-600 text-[8px] ml-1">last</span>}
                    </div>
                  : <span className="text-gray-600 text-sm">—</span>
              )}
            </div>
          </div>

          {/* Row 5 — Total Time */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center px-3">
              {isLoading ? <Skeleton className="w-20 h-4" /> : (
                <span className="text-white text-base font-light">Total Time</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center px-3">
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayTime
                  ? <div className="text-center w-full">
                      <span className="text-white text-xl font-light">
                        {displayTime.unit?.includes('second') ? formatSeconds(Math.round(displayTime.value)) : displayTime.value}
                      </span>
                      {!totalTime && <span className="text-gray-600 text-[8px] ml-1">last</span>}
                    </div>
                  : <span className="text-gray-600 text-sm">—</span>
              )}
            </div>
          </div>

          {/* Row 6 — Charts */}
          <div className="flex w-full h-[12.93%]">
            {/* Activity bar chart (distance per day) */}
            <div className="w-1/2 h-full border border-[#3B3B3B] flex flex-col p-2 overflow-hidden">
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                    <span>Day 1</span>
                    <span className="text-[#E63416]">DIST</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1">
                    <BarChart
                      data={activityBarData.length > 0 ? activityBarData : Array(totalDays).fill(20)}
                      color="#E63416"
                      activeBarCount={planDay}
                      inactiveColor="#444"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Weight chart */}
            <div className="w-1/2 h-full border border-[#3B3B3B] flex flex-col p-2 relative overflow-hidden">
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                    <span>Day 1</span>
                    <span className="text-[#3B63CF]">WEIGHT</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1 relative">
                    <BarChart
                      data={weightBarHeights.length > 0 ? weightBarHeights : Array(totalDays).fill(50)}
                      color="#3B63CF"
                      showConnectingLine
                      connectingLineColor="#ffffff"
                      connectingLineWidth={1}
                      connectingLineShadow="#EFE9E9"
                      activeBarCount={planDay}
                      inactiveColor="#666666"
                      showCurrentDayArrow
                      currentDayArrowColor="#ffffff"
                    />
                    <div className="absolute bottom-0 left-1">
                      <span className="text-white text-sm font-light">
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
                      <div className="absolute bottom-0 right-1 text-[9px] text-gray-400">
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
            <div className="w-[28.36%] h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? <Skeleton className="w-12 h-8" /> : (
                <span className="text-white text-3xl sm:text-4xl font-light">{dayName}</span>
              )}
            </div>
            <div className="w-[71.64%] h-full border border-[#3B3B3B] flex items-center justify-center gap-2">
              {isLoading ? <Skeleton className="w-32 h-16" /> : (
                <>
                  <span className="text-white text-5xl sm:text-6xl font-light tabular-nums">{clockTime}</span>
                  <span className="text-gray-400 text-xl sm:text-2xl">{clockAmPm}</span>
                </>
              )}
            </div>
          </div>

          {/* Row 8 — progress bar strip */}
          <div className="w-full h-[5.26%] border border-[#3B3B3B] flex items-center px-3 gap-1">
            {isLoading ? <Skeleton className="w-full h-3 rounded-full" /> : (
              <>
                <div className="flex-1 h-1.5 bg-[#3B3B3B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3B63CF] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (planDay / totalDays) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 whitespace-nowrap flex-shrink-0">
                  {planDay}/{totalDays}d
                </span>
              </>
            )}
          </div>

          {/* Row 9 — notes */}
          <div className="w-full h-[20.14%] border border-[#3B3B3B] flex flex-col p-2">
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <textarea
                className="w-full h-full bg-[#1a1a1a] text-white text-sm font-light rounded-lg p-2 border border-[#3B3B3B] resize-none outline-none focus:border-[#3B63CF] placeholder:text-gray-600"
                placeholder="Today's activity notes (auto-saved)..."
                value={dailyNotes}
                onChange={e => handleNotesChange(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
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
