'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';

// ─── helpers ────────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}/${m}`;
}

function getDaysSince(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00';
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildSchedule(intervalMinutes: number): Date[] {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    return new Date(now.getTime() + (i + 1) * intervalMinutes * 60 * 1000);
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const WaterBottleFiller = ({
  waterLevel,
  isAlertActive,
  alertBlink,
}: {
  waterLevel: number;
  isAlertActive: boolean;
  alertBlink: boolean;
}) => {
  const numRects = 12;
  const activeRects = Math.round((waterLevel / 100) * numRects);

  const getRectStyle = (index: number): React.CSSProperties => {
    const isActive = activeRects >= index;
    return {
      fill: isAlertActive ? (alertBlink ? '#FFFFFF' : '#3659B8') : '#3659B8',
      opacity: isActive ? 1 : 0,
      transition: isAlertActive ? 'fill 0.1s ease-out' : 'opacity 0.2s ease-out',
    };
  };

  return (
    <svg viewBox="0 0 1132 2717" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain" style={{ overflow: 'visible' }}>
      <rect x="91"  y="2489" width="946" height="170" style={getRectStyle(1)} />
      <rect x="91"  y="2144" width="946" height="345" style={getRectStyle(2)} />
      <rect x="91"  y="1799" width="946" height="345" style={getRectStyle(3)} />
      <rect x="95"  y="1463" width="946" height="336" style={getRectStyle(4)} />
      <rect x="95"  y="1127" width="946" height="336" style={getRectStyle(5)} />
      <rect x="95"  y="791"  width="946" height="336" style={getRectStyle(6)} />
      <rect x="95"  y="666"  width="946" height="125" style={getRectStyle(7)} />
      <rect x="205" y="541"  width="714" height="125" style={getRectStyle(8)} />
      <rect x="331" y="416"  width="487" height="125" style={getRectStyle(9)} />
      <rect x="353" y="291"  width="441" height="125" style={getRectStyle(10)} />
      <rect x="353" y="53"   width="441" height="238" style={getRectStyle(11)} />
    </svg>
  );
};

// ─── constants ───────────────────────────────────────────────────────────────

interface Plan { id: string; status: string; startDate: string | null; }

const INTERVAL_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr',   minutes: 60 },
  { label: '2 hr',   minutes: 120 },
  { label: '3 hr',   minutes: 180 },
];

const CUPS_PER_DAY = 12;

// ─── main page ───────────────────────────────────────────────────────────────

export default function WaterTrackerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [cupsToday, setCupsToday] = useState(0);

  // Sound ref
  const waterSoundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    waterSoundRef.current = new Audio('/sounds/mixkit-water-bubble-1317.wav');
    waterSoundRef.current.volume = 0.6;
  }, []);

  const [intervalIdx, setIntervalIdx] = useState(1);
  const [schedule, setSchedule] = useState<Date[]>([]);
  const [nextIdx, setNextIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now()); // live current time in ms
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertBlink, setAlertBlink] = useState(false);
  const notifiedRef = useRef<Set<number>>(new Set());

  const today = new Date();
  const displayDate = formatDisplayDate(today);
  const waterLevel = Math.min((cupsToday / CUPS_PER_DAY) * 100, 100);
  const isDone = cupsToday >= CUPS_PER_DAY;
  const dayNumber = getDaysSince(activePlan?.startDate ?? null);

  // Bootstrap
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) { router.push('/'); return; }
    setUser(JSON.parse(userStr));

    // localStorage fallback while DB loads
    const saved = localStorage.getItem(`water_cups_${getTodayKey()}`);
    if (saved !== null) setCupsToday(parseInt(saved, 10));

    const savedInterval = localStorage.getItem('water_interval_idx');
    if (savedInterval !== null) setIntervalIdx(parseInt(savedInterval, 10));

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [router]);

  const fetchPlan = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        const plans: Plan[] = data.plans || [];
        setActivePlan(plans.find((p) => p.status === 'IN_PROGRESS') ?? plans[0] ?? null);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [user?.email]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // Load today's water log from DB once user is known
  useEffect(() => {
    if (!user?.email) return;
    const loadFromDb = async () => {
      try {
        const res = await fetch(`/api/users/me/water?email=${encodeURIComponent(user.email)}&date=${getTodayKey()}`);
        if (res.ok) {
          const data = await res.json();
          setCupsToday(data.cups ?? 0);
          localStorage.setItem(`water_cups_${getTodayKey()}`, String(data.cups ?? 0));
        }
      } catch (e) { console.error('Error loading water log:', e); }
    };
    loadFromDb();
  }, [user?.email]);

  // Persist cups to DB + localStorage whenever cups change (after initial DB sync)
  const saveWater = useCallback(async (cups: number) => {
    localStorage.setItem(`water_cups_${getTodayKey()}`, String(cups));
    if (!user?.email) return;
    try {
      await fetch('/api/users/me/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, date: getTodayKey(), cups, goalCups: CUPS_PER_DAY }),
      });
    } catch (e) { console.error('Error saving water log:', e); }
  }, [user?.email]);
  useEffect(() => {
    const mins = INTERVAL_OPTIONS[intervalIdx].minutes;
    setSchedule(buildSchedule(mins));
    setNextIdx(0);
    notifiedRef.current.clear();
    localStorage.setItem('water_interval_idx', String(intervalIdx));
  }, [intervalIdx]);

  // Live countdown tick
  useEffect(() => {
    if (schedule.length === 0) return;
    const tick = () => {
      const now = Date.now();
      let found = -1;
      for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].getTime() > now) { found = i; break; }
      }
      if (found === -1) {
        setSchedule(buildSchedule(INTERVAL_OPTIONS[intervalIdx].minutes));
        notifiedRef.current.clear();
        setNextIdx(0);
        return;
      }
      setNextIdx(found);
      const ms = schedule[found].getTime() - now;
      setCountdown(ms);
      setNowMs(now);
      if (ms < 1000 && !notifiedRef.current.has(found)) {
        notifiedRef.current.add(found);
        setIsAlertActive(true);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💧 Time to drink water!', {
            body: 'Stay hydrated — add a cup to your tracker.',
            icon: '/vectors/water-bottle.svg',
          });
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [schedule, intervalIdx]);

  // Alert blink
  useEffect(() => {
    if (!isAlertActive) { setAlertBlink(false); return; }
    const id = setInterval(() => setAlertBlink((b) => !b), 300);
    return () => clearInterval(id);
  }, [isAlertActive]);

  const handleAddCup = () => {
    if (cupsToday >= CUPS_PER_DAY) return;
    const next = cupsToday + 1;
    setCupsToday(next);
    saveWater(next);
    setIsAlertActive(false);
    // Play water sound
    if (waterSoundRef.current) {
      waterSoundRef.current.currentTime = 0;
      waterSoundRef.current.play().catch(() => {});
    }
  };

  const handleRemoveCup = () => {
    if (cupsToday <= 0) return;
    const next = cupsToday - 1;
    setCupsToday(next);
    saveWater(next);
  };

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

          {/* Row 1 — date + progress */}
          <div className="flex w-full h-[16.48%]">
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Skeleton className="w-28 h-8" /> : (
                <span className="text-white text-2xl sm:text-3xl font-light">{displayDate}</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Skeleton className="w-24 h-10" /> : (
                <span className="text-white text-3xl sm:text-4xl font-light">
                  {isDone ? 'DONE' : `${cupsToday}/${CUPS_PER_DAY}`}
                </span>
              )}
            </div>
          </div>

          {/* Row 2 — WATER + day */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? <Skeleton className="w-32 h-8" /> : (
                <span className="text-white text-3xl sm:text-4xl font-light">WATER</span>
              )}
            </div>
            <div className="w-1/2 h-full border border-[#3B3B3B] flex items-center justify-center">
              {isLoading ? <Skeleton className="w-32 h-8" /> : (
                <span className="text-white font-bold text-center"
                  style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', lineHeight: '1' }}>
                  {dayNumber > 0 ? `DAY ${dayNumber}` : 'DAY 1'}
                </span>
              )}
            </div>
          </div>

          {/* Row 3 — main area */}
          <div className="w-full h-[52.75%] border border-[#3B3B3B] flex items-stretch">

            {/* Left: prev→next time bar with travelling arrow */}
            <div className="w-[31.75%] h-full flex flex-col items-center py-4">
              {isLoading ? <Skeleton className="w-full h-full rounded-lg" /> : (
                (() => {
                  const intervalMs = INTERVAL_OPTIONS[intervalIdx].minutes * 60 * 1000;

                  // Previous slot time (when the last reminder fired)
                  const prevSlotMs = nextIdx === 0
                    ? schedule[0]?.getTime() - intervalMs
                    : schedule[nextIdx - 1]?.getTime();
                  const nextSlotMs = schedule[nextIdx]?.getTime();

                  if (!prevSlotMs || !nextSlotMs) return null;

                  const totalWindow = nextSlotMs - prevSlotMs;
                  const elapsed = Math.max(0, nowMs - prevSlotMs);
                  // progress 0 = at prev label (bottom), 1 = at next label (top)
                  const progress = Math.min(1, elapsed / totalWindow);

                  // Arrow travels from 80% (bottom label) up to 15% (top label)
                  const TOP_PCT = 15;
                  const BOT_PCT = 80;
                  const arrowTopPct = BOT_PCT - progress * (BOT_PCT - TOP_PCT);

                  const nowTime = formatTime(new Date(nowMs));
                  const prevTime = formatTime(new Date(prevSlotMs));
                  const nextTime = formatTime(new Date(nextSlotMs));

                  return (
                    <div className="relative w-full h-full">
                      {/* Next time — top */}
                      <div className="absolute w-full flex justify-center" style={{ top: '8%' }}>
                        <span className="text-white text-sm font-light">{nextTime}</span>
                      </div>

                      {/* Vertical track line */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-0.5 rounded-full"
                        style={{
                          top: '15%',
                          bottom: '20%',
                          background: 'linear-gradient(to bottom, #E63416 0%, #3B3B3B 100%)',
                        }}
                      />

                      {/* Travelling arrow + current time label */}
                      <div
                        className="absolute left-1/2 z-10 pointer-events-none flex items-center"
                        style={{ top: `${arrowTopPct}%`, transform: 'translateY(-50%)' }}
                      >
                        <svg
                          width="16" height="26" viewBox="0 0 24 40" fill="none"
                          style={{ flexShrink: 0, marginLeft: '-8px' }}
                        >
                          <path d="M12 0L22 10L17 10L17 40L7 40L7 10L2 10L12 0Z" fill="#E63416" />
                        </svg>
                        <span
                          className="text-[#E63416] font-mono font-bold leading-none whitespace-nowrap"
                          style={{ fontSize: '8px', marginLeft: '2px' }}
                        >
                          {nowTime}
                        </span>
                      </div>

                      {/* Prev time — bottom */}
                      <div className="absolute w-full flex justify-center" style={{ bottom: '8%' }}>
                        <span className="text-gray-500 text-sm font-light line-through">{prevTime}</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Center: water bottle */}
            <div className="relative flex items-center justify-center" style={{ width: '36.5%', height: '100%' }}>
              {isLoading ? <Skeleton className="w-full h-full rounded-lg" /> : (
                <>
                  <div className="absolute bottom-[12.04%] left-0 right-0 mx-auto w-full h-[75.92%] transition-all duration-200 ease-out">
                    <WaterBottleFiller waterLevel={waterLevel} isAlertActive={isAlertActive} alertBlink={alertBlink} />
                  </div>
                  <img src="/vectors/water-bottle.svg" alt="Water Bottle"
                    className="w-full h-[75.92%] object-contain relative z-10"
                    style={{
                      transition: 'filter 0.1s ease-out',
                      filter: isAlertActive ? (alertBlink ? 'brightness(0) invert(1)' : 'none') : 'none',
                    }} />
                </>
              )}
            </div>

            {/* Right: add/remove + countdown */}
            <div className="w-[31.75%] h-full flex flex-col items-center justify-center gap-3">
              {isLoading ? <Skeleton className="w-20 h-20 rounded-full" /> : (
                <>
                  <div className={`cursor-pointer ${isDone ? 'opacity-30 pointer-events-none' : ''}`} onClick={handleAddCup}>
                    <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] border-2 border-white rounded-full flex items-center justify-center hover:border-blue-400 transition-colors">
                      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5V35M5 20H35" stroke="white" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center transition-colors ${isAlertActive ? 'text-[#E63416]' : 'text-gray-400'}`}>
                    <span className="text-[10px] uppercase tracking-widest leading-none">next</span>
                    <span className="text-sm font-mono font-semibold tabular-nums">
                      {schedule.length > 0 ? formatCountdown(countdown) : '--:--'}
                    </span>
                  </div>

                  <div className={`cursor-pointer ${cupsToday <= 0 ? 'opacity-30 pointer-events-none' : ''}`} onClick={handleRemoveCup}>
                    <div className="w-[48px] h-[48px] border border-gray-600 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                        <path d="M5 20H35" stroke="#aaa" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 4 — interval picker + cup dots */}
          <div className="w-full h-[20.14%] border border-[#3B3B3B] flex flex-col items-center justify-center gap-2 px-3">
            {isLoading ? <Skeleton className="w-32 h-10" /> : (
              <>
                <div className="flex gap-1.5">
                  {INTERVAL_OPTIONS.map((opt, idx) => (
                    <button key={idx} onClick={() => setIntervalIdx(idx)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        idx === intervalIdx
                          ? 'bg-[#3659B8] text-white'
                          : 'bg-[#3B3B3B] text-gray-400 hover:bg-[#4a4a4a]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 flex-wrap justify-center">
                  {Array.from({ length: CUPS_PER_DAY }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                      style={{ backgroundColor: i < cupsToday ? '#3659B8' : '#3B3B3B' }} />
                  ))}
                </div>

                <span className="text-gray-500 text-[10px]">
                  {cupsToday < CUPS_PER_DAY
                    ? `${CUPS_PER_DAY - cupsToday} cups remaining`
                    : '🎉 Daily goal reached!'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}
