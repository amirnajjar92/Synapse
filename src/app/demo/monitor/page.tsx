'use client';

import { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';
import { BarChart } from '@/components/BarChart';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import FloatingNavBar from '@/components/FloatingNavBar';
import {
  parseWeightGoalFromPrompt,
  generateMockWeightKg,
  toWeightChartHeights,
  type PlanEntryWithMetrics,
} from '@/lib/weightGoal';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

// MOCK DATA
const MOCK_PLAN = {
  id: 'demo-plan-1',
  title: 'Summer Shred 2026',
  prompt: 'lose 8kg by September 2026, current weight 78kg',
  icon: '🏃',
  status: 'IN_PROGRESS',
  startDate: '2026-06-01',
  endDate: '2026-08-31',
};

const PLAN_DAY = 32;
const TOTAL_DAYS = 92;

// Generate mock weight data
const generateMockWeights = () => {
  const weights = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const progress = i / TOTAL_DAYS;
    const weight = 78 - (progress * 6) + (Math.sin(i * 0.3) * 0.8);
    weights.push(Math.max(70, Math.min(80, weight)));
  }
  return weights;
};

// Generate mock distance data
const generateMockDistance = () => {
  const distances = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const baseDistance = 5 + Math.sin(i * 0.5) * 3 + Math.random() * 4;
    distances.push(i < PLAN_DAY ? Math.max(0, baseDistance) : 0);
  }
  return distances;
};

const mockWeights = generateMockWeights();
const mockDistances = generateMockDistance();

const toDistanceBarData = (distances: number[]) => {
  const max = Math.max(...distances) || 15;
  return distances.map(d => Math.min(100, (d / max) * 100));
};

const weightBarHeights = toWeightChartHeights(mockWeights);
const activityBarData = toDistanceBarData(mockDistances);

const TODAY_METRICS = {
  distance: { value: 8.5, unit: 'km' },
  pace: { value: 318, unit: 'seconds/km' },
  totalTime: { value: 2703, unit: 'seconds' },
  weight: { value: 73.2, unit: 'kg' },
};

const MOCK_ENTRIES: PlanEntryWithMetrics[] = Array.from({ length: PLAN_DAY }, (_, i) => ({
  date: new Date(Date.parse(MOCK_PLAN.startDate!) + i * 86400000).toISOString().split('T')[0],
  metrics: [
    { type: 'distance', value: mockDistances[i], unit: 'km' },
    { type: 'weight', value: mockWeights[i], unit: 'kg' },
  ],
  notes: null,
}));

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

const monitorPalettes = [
  {
    id: 'default',
    primary: 'rgba(255,255,255,0.6)',
    distance: '#E63416',
    bg: '#0b0b0b',
    frame: 'rgba(11,11,11,0.3)',
    panel: 'rgba(11,11,11,0.96)',
    text: '#e5e5e5',
    textSecondary: 'rgba(255,255,255,0.45)',
    textMuted: 'rgba(255,255,255,0.3)',
    border: 'rgba(255,255,255,0.06)',
    borderSoft: 'rgba(255,255,255,0.08)',
  },
  {
    id: 'sport-blue',
    primary: '#3B63CF',
    distance: '#60A5FA',
    bg: '#08111f',
    frame: 'rgba(8,17,31,0.45)',
    panel: 'rgba(11,18,32,0.96)',
    text: '#eaf2ff',
    textSecondary: 'rgba(161,185,230,0.85)',
    textMuted: 'rgba(148,163,184,0.75)',
    border: 'rgba(96,165,250,0.22)',
    borderSoft: 'rgba(96,165,250,0.32)',
  },
  {
    id: 'fresh-green',
    primary: '#10B981',
    distance: '#34D399',
    bg: '#071910',
    frame: 'rgba(7,25,16,0.45)',
    panel: 'rgba(10,28,19,0.96)',
    text: '#ecfff4',
    textSecondary: 'rgba(167,243,208,0.85)',
    textMuted: 'rgba(134,239,172,0.75)',
    border: 'rgba(52,211,153,0.22)',
    borderSoft: 'rgba(52,211,153,0.32)',
  },
  {
    id: 'sunrise-orange',
    primary: '#F59E0B',
    distance: '#FB7185',
    bg: '#1a1208',
    frame: 'rgba(26,18,8,0.45)',
    panel: 'rgba(34,24,11,0.96)',
    text: '#fff4e6',
    textSecondary: 'rgba(253,186,116,0.85)',
    textMuted: 'rgba(251,191,36,0.75)',
    border: 'rgba(245,158,11,0.24)',
    borderSoft: 'rgba(245,158,11,0.34)',
  },
  {
    id: 'ocean-energy',
    primary: '#0EA5E9',
    distance: '#22D3EE',
    bg: '#061522',
    frame: 'rgba(6,21,34,0.45)',
    panel: 'rgba(8,26,40,0.96)',
    text: '#e7f8ff',
    textSecondary: 'rgba(125,211,252,0.85)',
    textMuted: 'rgba(56,189,248,0.75)',
    border: 'rgba(34,211,238,0.22)',
    borderSoft: 'rgba(34,211,238,0.32)',
  },
];

function MonitorDemoContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showAIModal, setShowAIModal] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePalette = monitorPalettes[paletteIndex];

  const handlePaletteCycle = () => {
    setPaletteIndex((prev) => (prev + 1) % monitorPalettes.length);
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const displayDistance = TODAY_METRICS.distance;
  const displayPace = TODAY_METRICS.pace;
  const displayTime = TODAY_METRICS.totalTime;
  const weight = TODAY_METRICS.weight;

  const weightGoal = parseWeightGoalFromPrompt(MOCK_PLAN.prompt);
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const time12 = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const [clockTime, clockAmPm] = time12.split(' ');

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div className="w-full h-screen flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: activePalette.bg }}>
      <div
        className="overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{ 
          width: `min(95vw, ${baseWidth}px)`, 
          aspectRatio: baseWidth / baseHeight, 
          maxHeight: '95vh',
          borderRadius: '40px',
          backgroundColor: activePalette.frame,
        }}
      >
        <div className="w-full h-full flex flex-col relative">
          {/* Header Row 1 */}
          <div className="flex w-full h-[6%] relative items-center">
            <div className="absolute top-3 left-3 z-20">
              <BurgerMenuButton />
            </div>
            <button
              onClick={handlePaletteCycle}
              className="absolute top-3 right-3 z-20 w-5 h-5 rounded-full border transition-transform hover:scale-105"
              style={{
                borderColor: activePalette.borderSoft,
                background: `linear-gradient(135deg, ${activePalette.primary} 20%, ${activePalette.distance} 100%)`,
              }}
              aria-label="Change monitor colors"
              title="Change monitor colors"
            />
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-hanalei-fill)', color: activePalette.text }}>
                SYNAPSE
              </span>
            </div>
          </div>

          {/* Header Row 2 */}
          <div className="flex w-full h-[6%]">
            <div className="w-1/2 h-full flex items-center justify-center px-3">
              <span className="text-lg sm:text-xl md:text-2xl font-light tabular-nums" style={{ color: activePalette.text }}>
                {now.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3">
              <span className="text-sm sm:text-base font-light text-center" style={{ color: activePalette.text }}>
                {MOCK_PLAN.title}
              </span>
            </div>
          </div>

          {/* Row 3 — ACTIVITY + day */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderTop: `1px solid ${activePalette.border}`, borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <span className="text-xl sm:text-2xl font-light" style={{ color: activePalette.text }}>ACTIVITY</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center" style={{ borderTop: `1px solid ${activePalette.border}`, borderBottom: `1px solid ${activePalette.border}` }}>
              <span className="font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', lineHeight: 1, color: activePalette.text }}>
                DAY {PLAN_DAY}
              </span>
            </div>
          </div>

          {/* Row 4 — Distance */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <span className="text-base font-light" style={{ color: activePalette.text }}>Distance</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              <div className="text-center w-full">
                <span className="text-xl font-light" style={{ color: activePalette.text }}>{displayDistance.value}</span>
                <span className="text-xs ml-1" style={{ color: activePalette.textSecondary }}>{displayDistance.unit}</span>
              </div>
            </div>
          </div>

          {/* Row 5 — Pace */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <span className="text-base font-light" style={{ color: activePalette.text }}>Pace</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              <div className="text-center w-full">
                <span className="text-xl font-light" style={{ color: activePalette.text }}>
                  {formatPace(displayPace.value)}
                </span>
                <span className="text-xs ml-1" style={{ color: activePalette.textSecondary }}>/km</span>
              </div>
            </div>
          </div>

          {/* Row 6 — Total Time */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <span className="text-base font-light" style={{ color: activePalette.text }}>Total Time</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              <div className="text-center w-full">
                <span className="text-xl font-light" style={{ color: activePalette.text }}>
                  {formatSeconds(Math.round(displayTime.value))}
                </span>
              </div>
            </div>
          </div>

          {/* Row 7 — Charts */}
          <div className="flex w-full h-[12.93%]">
            <div className="w-1/2 h-full flex flex-col p-2 overflow-hidden" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <div className="flex justify-between text-[9px] mb-1" style={{ color: activePalette.textSecondary }}>
                <span>Day 1</span>
                <span style={{ color: activePalette.distance }}>DIST</span>
                <span>Day {TOTAL_DAYS}</span>
              </div>
              <div className="flex-1 flex">
                <div className="w-7 flex flex-col justify-between pr-1 flex-shrink-0">
                  {[15, 11, 7, 4, 0].map((val, idx) => (
                    <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                      {val}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <BarChart
                    data={activityBarData}
                    color={activePalette.distance}
                    activeBarCount={PLAN_DAY}
                    inactiveColor={activePalette.borderSoft}
                    showConnectingLine
                    connectingLineColor={activePalette.textMuted}
                    connectingLineWidth={1}
                    showCurrentDayArrow
                    currentDayArrowColor={activePalette.distance}
                  />
                </div>
              </div>
            </div>

            <div className="w-1/2 h-full flex flex-col p-2 relative overflow-hidden" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              <div className="flex justify-between text-[9px] mb-1" style={{ color: activePalette.textSecondary }}>
                <span>Day 1</span>
                <span style={{ color: activePalette.primary }}>WEIGHT</span>
                <span>Day {TOTAL_DAYS}</span>
              </div>
              <div className="flex-1 flex relative">
                <div className="w-7 flex flex-col justify-between pr-1 flex-shrink-0">
                  {[80, 76, 72, 68, 64].map((val, idx) => (
                    <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                      {val}
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <BarChart
                    data={weightBarHeights}
                    color={activePalette.primary}
                    showConnectingLine
                    connectingLineColor={activePalette.textMuted}
                    connectingLineWidth={1}
                    connectingLineShadow="rgba(239,233,233,0.49)"
                    activeBarCount={PLAN_DAY}
                    inactiveColor={activePalette.borderSoft}
                    showCurrentDayArrow
                    currentDayArrowColor={activePalette.primary}
                  />
                  <div className="absolute bottom-0 right-1">
                    <span className="text-sm font-light" style={{ color: activePalette.text }}>
                      {weight.value}kg
                    </span>
                  </div>
                  {weightGoal.goalWeight && (
                    <div className="absolute top-0 right-1 text-[9px]" style={{ color: activePalette.textSecondary }}>
                      →{weightGoal.goalWeight}kg
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 8 — Live clock */}
          <div className="flex w-full h-[17.85%]">
            <div className="w-[28.36%] h-full flex items-center justify-center" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              <span className="text-3xl sm:text-4xl font-light" style={{ color: activePalette.text }}>{dayName}</span>
            </div>
            <div className="w-[71.64%] h-full flex items-center justify-center gap-2" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              <span className="text-5xl sm:text-6xl font-light tabular-nums" style={{ color: activePalette.text }}>{clockTime}</span>
              <span className="text-xl sm:text-2xl" style={{ color: activePalette.textSecondary }}>{clockAmPm}</span>
            </div>
          </div>

          {/* Row 9 — progress bar */}
          <div className="w-full h-[5.26%] flex items-center px-3 gap-1" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: activePalette.borderSoft }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (PLAN_DAY / TOTAL_DAYS) * 100)}%`, backgroundColor: activePalette.primary }}
              />
            </div>
            <span className="text-[9px] whitespace-nowrap flex-shrink-0" style={{ color: activePalette.textSecondary }}>
              {PLAN_DAY}/{TOTAL_DAYS}d
            </span>
          </div>

          {/* Row 10 — Insights */}
          <div ref={scrollRef} className="w-full flex-1 flex flex-col p-3 overflow-y-auto scrollbar-thin scroll-fade-edges">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold tracking-wider" style={{ color: activePalette.primary }}>
                INSIGHTS & TIPS
              </h4>
              <span className="text-[9px]" style={{ color: activePalette.textMuted }}>
                AI Analysis
              </span>
            </div>
            
            <div className="flex-1 space-y-3 text-xs" style={{ color: activePalette.text }}>
              <div className="leading-relaxed">
                <p className="font-bold mb-1" style={{ color: activePalette.primary }}>
                  Strong effort this week!
                </p>
                <p style={{ color: activePalette.textSecondary }}>
                  5 workouts completed. You are on the right track!
                </p>
              </div>
              <div className="leading-relaxed pt-2 border-t" style={{ borderColor: activePalette.border }}>
                <p className="font-medium mb-1" style={{ color: activePalette.text }}>
                  Recommendation
                </p>
                <p style={{ color: activePalette.textSecondary }}>
                  Keep this momentum while ensuring proper recovery days.
                </p>
              </div>
              <div className="leading-relaxed pt-2 border-t" style={{ borderColor: activePalette.border }}>
                <p style={{ color: activePalette.textMuted, fontSize: '10px' }}>
                  Weekly total: 38.2km across 5 days
                </p>
              </div>
            </div>
          </div>

          {showAIModal && (
            <div className="absolute inset-x-3 bottom-3 z-30 overflow-hidden rounded-xl border" style={{ backgroundColor: activePalette.panel, borderColor: activePalette.borderSoft }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: activePalette.border }}>
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-hanalei-fill)', color: activePalette.text }}>
                  Activity Logger
                </h3>
              </div>
              <div className="pb-3">
                <PromptBoxOpenAI
                  value={notesInput}
                  onChange={setNotesInput}
                  onEnterPressed={() => {}}
                  onClose={() => setShowAIModal(false)}
                  placeholder="Log your activities and I'll extract the metrics..."
                  isLoading={isExtracting}
                  thinkingMessages={chatMessages}
                  showChat
                  chatHeight={180}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingNavBar onAIClick={() => setShowAIModal(true)} />
    </div>
  );
}

export default function MonitorDemoPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#0b0b0b] flex items-center justify-center">
        <Skeleton className="w-40 h-10 rounded" />
      </div>
    }>
      <MonitorDemoContent />
    </Suspense>
  );
}
