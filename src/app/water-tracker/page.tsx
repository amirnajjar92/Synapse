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

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
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

  const isActive = (index: number) => activeRects >= index;

  const getRectStyle = (index: number): React.CSSProperties => {
    const active = isActive(index);
    return {
      opacity: active ? 1 : 0,
      transition: isAlertActive && active ? 'fill 0.1s ease-out' : 'opacity 0.2s ease-out',
    };
  };

  const getFill = (index: number) => {
    if (!isActive(index)) return 'transparent';
    if (isAlertActive && alertBlink) return '#FFFFFF';
    return 'url(#waterGrad)';
  };

  return (
    <svg viewBox="0 0 1132 2717" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="waterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <rect x="89"  y="2487" width="948" height="173" fill={getFill(1)} style={getRectStyle(1)} />
      <rect x="89"  y="2142" width="948" height="348" fill={getFill(2)} style={getRectStyle(2)} />
      <rect x="89"  y="1797" width="948" height="348" fill={getFill(3)} style={getRectStyle(3)} />
      <rect x="93"  y="1461" width="948" height="339" fill={getFill(4)} style={getRectStyle(4)} />
      <rect x="93"  y="1125" width="948" height="339" fill={getFill(5)} style={getRectStyle(5)} />
      <rect x="93"  y="789"  width="948" height="339" fill={getFill(6)} style={getRectStyle(6)} />
      <rect x="93"  y="664"  width="950" height="128" fill={getFill(7)} style={getRectStyle(7)} />
      <rect x="203" y="539"  width="718" height="128" fill={getFill(8)} style={getRectStyle(8)} />
      <rect x="329" y="414"  width="491" height="128" fill={getFill(9)} style={getRectStyle(9)} />
      <rect x="351" y="289"  width="445" height="128" fill={getFill(10)} style={getRectStyle(10)} />
      <rect x="351" y="51"   width="445" height="241" fill={getFill(11)} style={getRectStyle(11)} />
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
        <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: '#0b0b0b4D' }}>
          <div className="absolute top-4 left-4 z-10"><BurgerMenuButton /></div>

          {/* Row 1 — date + progress */}
          <div className="flex w-full h-[16.48%]">
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Spinner size={24} /> : (
                <span className="text-white/80 text-xl sm:text-2xl font-light tracking-wide">{displayDate}</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Spinner size={24} /> : (
                <span className="text-white text-2xl sm:text-3xl font-light tracking-wide">
                  {isDone ? 'DONE' : `${cupsToday}/${CUPS_PER_DAY}`}
                </span>
              )}
            </div>
          </div>

          {/* Row 2 — WATER + day */}
          <div className="flex w-full h-[9.61%] border-t border-[#3B3B3B33]">
            <div className="w-1/2 h-full flex items-center justify-center">
              {isLoading ? <Spinner size={24} /> : (
                <span className="text-white font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.7)', lineHeight: '1' }}>
                  WATER
                </span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center border-l border-[#3B3B3B33]">
              {isLoading ? <Spinner size={24} /> : (
                <span className="text-white font-bold text-center" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.7)', lineHeight: '1' }}>
                  {dayNumber > 0 ? `DAY ${dayNumber}` : 'DAY 1'}
                </span>
              )}
            </div>
          </div>

          {/* Row 3 — main area */}
          <div className="w-full h-[52.75%] border-t border-[#3B3B3B33] flex items-stretch">

            {/* Left: prev→next time bar with travelling arrow */}
            <div className="w-[31.75%] h-full flex flex-col items-center py-4">
              {isLoading ? <Spinner size={24} /> : (
                (() => {
                  const intervalMs = INTERVAL_OPTIONS[intervalIdx].minutes * 60 * 1000;
                  const prevSlotMs = nextIdx === 0
                    ? schedule[0]?.getTime() - intervalMs
                    : schedule[nextIdx - 1]?.getTime();
                  const nextSlotMs = schedule[nextIdx]?.getTime();
                  if (!prevSlotMs || !nextSlotMs) return null;
                  const totalWindow = nextSlotMs - prevSlotMs;
                  const elapsed = Math.max(0, nowMs - prevSlotMs);
                  const progress = Math.min(1, elapsed / totalWindow);
                  const TOP_PCT = 15;
                  const BOT_PCT = 80;
                  const arrowTopPct = BOT_PCT - progress * (BOT_PCT - TOP_PCT);
                  const nowTime = formatTime(new Date(nowMs));
                  const prevTime = formatTime(new Date(prevSlotMs));
                  const nextTime = formatTime(new Date(nextSlotMs));
                  return (
                    <div className="relative w-full h-full">
                      <div className="absolute w-full flex justify-center" style={{ top: '8%' }}>
                        <span className="text-white/70 text-sm font-light">{nextTime}</span>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 w-0.5 rounded-full" style={{ top: '15%', bottom: '20%', background: 'linear-gradient(to bottom, #E63416 0%, #3B3B3B 100%)' }} />
                      <div className="absolute left-1/2 z-10 pointer-events-none flex items-center" style={{ top: `${arrowTopPct}%`, transform: 'translateY(-50%)' }}>
                        <svg width="16" height="26" viewBox="0 0 24 40" fill="none" style={{ flexShrink: 0, marginLeft: '-8px' }}>
                          <path d="M12 0L22 10L17 10L17 40L7 40L7 10L2 10L12 0Z" fill="#E63416" />
                        </svg>
                        <span className="text-[#E63416] font-mono font-bold leading-none whitespace-nowrap" style={{ fontSize: '8px', marginLeft: '2px' }}>
                          {nowTime}
                        </span>
                      </div>
                      <div className="absolute w-full flex justify-center" style={{ bottom: '8%' }}>
                        <span className="text-gray-600 text-sm font-light line-through">{prevTime}</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Center: water bottle */}
            <div className="relative flex items-center justify-center border-l border-[#3B3B3B33]" style={{ width: '36.5%', height: '100%' }}>
              {isLoading ? <Spinner size={24} /> : (
                <>
                  <div className="absolute bottom-[12.04%] left-0 right-0 mx-auto w-full h-[75.92%] transition-all duration-200 ease-out"
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
                    <WaterBottleFiller waterLevel={waterLevel} isAlertActive={isAlertActive} alertBlink={alertBlink} />
                  </div>
                  <img src="/vectors/water-bottle.svg" alt="Water Bottle"
                    className="w-full h-[75.92%] object-contain relative z-10"
                    style={{
                      filter: `drop-shadow(2px 4px 6px rgba(0,0,0,0.5)) ${isAlertActive ? (alertBlink ? 'brightness(0) invert(1)' : '') : ''}`,
                    }} />
                </>
              )}
            </div>

            {/* Right: add/remove + countdown */}
            <div className="w-[31.75%] h-full flex flex-col items-center justify-center gap-3 border-l border-[#3B3B3B33]">
              {isLoading ? <Spinner size={24} /> : (
                <>
                  <div className={`cursor-pointer ${isDone ? 'opacity-30 pointer-events-none' : ''}`} onClick={handleAddCup}>
                    <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90">
                      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                        <path d="M20 5V35M5 20H35" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center transition-colors ${isAlertActive ? 'text-[#E63416]' : 'text-gray-500'}`}>
                    <span className="text-[9px] uppercase tracking-widest leading-none">next</span>
                    <span className="text-sm font-mono font-semibold tabular-nums">
                      {schedule.length > 0 ? formatCountdown(countdown) : '--:--'}
                    </span>
                  </div>

                  <div className={`cursor-pointer ${cupsToday <= 0 ? 'opacity-30 pointer-events-none' : ''}`} onClick={handleRemoveCup}>
                    <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center border border-gray-700 hover:border-gray-500 transition-all active:scale-90">
                      <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                        <path d="M5 20H35" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 4 — interval picker + cup dots */}
          <div className="w-full h-[20.14%] border-t border-[#3B3B3B33] flex flex-col items-center justify-center gap-2.5 px-3">
            {isLoading ? <Spinner size={24} /> : (
              <>
                <div className="flex gap-1.5">
                  {INTERVAL_OPTIONS.map((opt, idx) => (
                    <button key={idx} onClick={() => setIntervalIdx(idx)}
                      className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                        idx === intervalIdx
                          ? 'bg-white text-black'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 flex-wrap justify-center">
                  {Array.from({ length: CUPS_PER_DAY }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: i < cupsToday ? '#3659B8' : '#3B3B3B' }} />
                  ))}
                </div>

                <span className="text-gray-500 text-[10px]">
                  {cupsToday < CUPS_PER_DAY
                    ? `${CUPS_PER_DAY - cupsToday} cups remaining`
                    : 'Daily goal reached!'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <FloatingNavBar />
    </div>
  );
}
