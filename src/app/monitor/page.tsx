'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BarChart } from '@/components/BarChart';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import FloatingNavBar from '@/components/FloatingNavBar';
import {
  parseWeightGoalFromPrompt,
  generateMockWeightKg,
  buildWeightKgFromEntries,
  toWeightChartHeights,
  type PlanEntryWithMetrics,
} from '@/lib/weightGoal';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2, onDebug?: (event: string, data?: any) => void): Promise<Response> {
  for (let i = 0; i <= maxRetries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    try {
      const t0 = Date.now();
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      const duration = Date.now() - t0;
      if (res.ok) {
        onDebug?.('fetch_ok', { attempt: i + 1, status: res.status, duration });
        return res;
      }
      onDebug?.('fetch_retry', { attempt: i + 1, status: res.status, duration });
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      else return res;
    } catch (e: unknown) {
      clearTimeout(timeoutId);
      console.warn(`fetchWithRetry attempt ${i + 1} failed:`, e);
      const serialized = e instanceof Error
        ? { message: e.message, name: e.name }
        : { raw: JSON.stringify(e, Object.getOwnPropertyNames(e)) };
      onDebug?.('fetch_error', { attempt: i + 1, ...serialized });
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      else throw e;
    }
  }
  throw new Error('Network error after retries');
}

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

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  tables?: { title: string; rows: { columns: string[] }[] }[];
}

interface Metric { type: string; value: number; unit?: string | null; }

function isWorkoutPlan(plan: Plan): boolean {
  return plan.tables?.some((t) => t.title === 'WORKOUT PLAN') ?? false;
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

function MonitorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [todayMetrics, setTodayMetrics] = useState<Metric[]>([]);
  const [planEntries, setPlanEntries] = useState<PlanEntryWithMetrics[]>([]);

  const [now, setNow] = useState(new Date());

  const [dailyNotes, setDailyNotes] = useState('');
  const [notesHistory, setNotesHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDescribing, setIsDescribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const debugSession = useRef(crypto.randomUUID()).current;

  const debugLog = useCallback(async (event: string, data?: any) => {
    try {
      await fetch('/api/debug-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: debugSession, event, data }),
      });
    } catch {
      // silently fail — debug logging should never interrupt the user
    }
  }, [debugSession]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        debugLog('base64_success', { name: file.name, size: file.size });
        resolve(reader.result as string);
      };
      reader.onerror = (e) => {
        debugLog('base64_error', { name: file.name, size: file.size, error: e });
        reject(e);
      };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const source = e.target === cameraInputRef.current ? 'camera' : 'gallery';

    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
    debugLog('file_selected', { name: file.name, size: file.size, type: file.type, source });
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const [weightsKg, setWeightsKg] = useState<number[]>([]);
  const [activityBarData, setActivityBarData] = useState<number[]>([]);
  const [distanceValuesKm, setDistanceValuesKm] = useState<number[]>([]);
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) { router.push('/'); return; }
    setUser(JSON.parse(userStr));

    const savedPalette = Number(localStorage.getItem('monitor_palette_idx') || '0');
    if (!Number.isNaN(savedPalette) && savedPalette >= 0 && savedPalette < monitorPalettes.length) {
      setPaletteIndex(savedPalette);
    }
  }, [router]);

  const activePalette = monitorPalettes[paletteIndex] || monitorPalettes[0];

  const handlePaletteCycle = () => {
    const next = (paletteIndex + 1) % monitorPalettes.length;
    setPaletteIndex(next);
    localStorage.setItem('monitor_palette_idx', String(next));
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
        const monitorPlans = list.filter((p) => !isWorkoutPlan(p));

        // Prioritize most-used / most-logged plans first
        const countsByPlanId = new Map<string, number>();
        try {
          const entriesUrl = new URL('/api/users/me/daily-entries', window.location.origin);
          entriesUrl.searchParams.set('email', user.email);
          const entriesRes = await fetch(entriesUrl.toString());
          if (entriesRes.ok) {
            const entriesData = await entriesRes.json();
            const dailyEntries: Array<{ planId?: string }> = entriesData.dailyEntries || [];
            for (const entry of dailyEntries) {
              if (!entry.planId) continue;
              countsByPlanId.set(entry.planId, (countsByPlanId.get(entry.planId) || 0) + 1);
            }
          }
        } catch (e) {
          console.error('Error fetching usage counts for plans:', e);
        }

        const sortedMonitorPlans = [...monitorPlans].sort((a, b) => {
          const aCount = countsByPlanId.get(a.id) || 0;
          const bCount = countsByPlanId.get(b.id) || 0;
          if (bCount !== aCount) return bCount - aCount;

          if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
          if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;

          return (a.title || '').localeCompare(b.title || '');
        });

        setPlans(sortedMonitorPlans);
        let target: Plan | null = null;
        const planId = searchParams.get('planId');
        if (planId) {
          const requested = sortedMonitorPlans.find(p => p.id === planId) ?? null;
          target = requested;
        }
        if (!target) {
          target = sortedMonitorPlans.find(p => p.status === 'IN_PROGRESS') ?? sortedMonitorPlans[0] ?? null;
        }
        setSelectedPlan(target);
      }
    } catch (e) {
      console.error('Error fetching plans:', e);
    }
  }, [user?.email, searchParams]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const fetchData = useCallback(async () => {
    if (!user?.email || !selectedPlan) return;
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

        const totalDays = getPlanTotalDays(selectedPlan.startDate, selectedPlan.endDate);
        const goal = parseWeightGoalFromPrompt(selectedPlan.prompt);
        const realWeights = buildWeightKgFromEntries(entries, selectedPlan.startDate ?? '', totalDays);
        setWeightsKg(realWeights ?? generateMockWeightKg(totalDays, goal, selectedPlan.id));

        const distanceByDay: number[] = Array(totalDays).fill(0);
        const distanceKm: number[] = Array(totalDays).fill(0);
        if (selectedPlan.startDate) {
          const start = new Date(selectedPlan.startDate);
          start.setHours(0, 0, 0, 0);
          for (const entry of entries) {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            const idx = Math.round((d.getTime() - start.getTime()) / 86400000);
            const dist = entry.metrics.find(m => m.type === 'distance');
            if (dist && idx >= 0 && idx < totalDays) {
              distanceKm[idx] = dist.value;
              distanceByDay[idx] = Math.min(100, (dist.value / 15) * 100);
            }
          }
        }
        setDistanceValuesKm(distanceKm);
        setActivityBarData(distanceByDay);
      }
    } catch (e) {
      console.error('Error fetching entries:', e);
    }

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
    } catch (e) {
      console.error('Error fetching today data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, selectedPlan]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    debugLog('session_start', { userAgent: navigator.userAgent });
  }, [debugLog]);

  const handleSendToAI = async () => {
    if (!user?.email || !selectedPlan || (!notesInput.trim() && !uploadedImage)) return;
    const userMessage = notesInput.trim();
    if (userMessage) {
      setNotesHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    }
    setNotesInput('');
    setIsExtracting(true);
    setChatMessages([]);

    try {
      let finalPrompt = userMessage;

      if (uploadedImage) {
        setIsDescribing(true);
        setChatMessages(prev => [...prev, 'Reading your watch screen...']);

        let base64: string | null = null;
        try {
          base64 = await fileToBase64(uploadedImage);
          debugLog('base64_converted', { size: base64.length });
        } catch {
          debugLog('base64_skipped', { name: uploadedImage.name, type: uploadedImage.type });
          setChatMessages(prev => [...prev, 'Converting image format...']);
          try {
            const convForm = new FormData();
            convForm.append('file', uploadedImage);
            const convRes = await fetch('https://moole-back.vercel.app/convert-image', {
              method: 'POST',
              body: convForm,
            });
            if (convRes.ok) {
              const jpegBlob = await convRes.blob();
              const jpegFile = new File([jpegBlob], 'converted.jpg', { type: 'image/jpeg' });
              if (imagePreview) URL.revokeObjectURL(imagePreview);
              setUploadedImage(jpegFile);
              setImagePreview(URL.createObjectURL(jpegFile));
              base64 = await fileToBase64(jpegFile);
              debugLog('server_converted', { size: jpegBlob.size });
            } else {
              const errData = await convRes.json().catch(() => ({}));
              debugLog('server_convert_failed', { status: convRes.status, error: errData.error });
            }
          } catch (convErr) {
            debugLog('server_convert_error', { message: String(convErr) });
          }

          if (!base64) {
            const skipMsg = 'Could not read image format. Proceeding without watch screen analysis.';
            setChatMessages(prev => [...prev, skipMsg]);
          }
        }

        if (!base64) {
          setIsDescribing(false);
          finalPrompt = userMessage || 'Activity logged with photo';
        } else {
          const describePrompt = 'Extract fitness activity data from this watch screen. Look for distance, time, pace, heart rate, steps, calories, and any other metrics visible. Return the raw numbers.';

          let description = '';

          try {
            const t0 = Date.now();
            const paidRes = await fetch('https://moole-back.vercel.app/describe-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_base64: base64, prompt: describePrompt }),
            });
            const duration = Date.now() - t0;
            const paidData = paidRes.ok ? await paidRes.json() : null;
            description = paidData?.description || '';
            debugLog('describe_paid', { ok: paidRes.ok, status: paidRes.status, duration, hasDescription: !!description });
          } catch (e: any) {
            console.warn('Paid describe-image failed, falling back to free', e);
            debugLog('describe_paid_error', { message: e?.message, stack: e?.stack });
          }

          if (!description) {
            try {
              const t0 = Date.now();
              const freeRes = await fetch('https://moole-back.vercel.app/describe-image-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: base64 }),
              });
              const duration = Date.now() - t0;
              const freeData = freeRes.ok ? await freeRes.json() : null;
              description = freeData?.description || '';
              debugLog('describe_free', { ok: freeRes.ok, status: freeRes.status, duration, hasDescription: !!description });
            } catch (e2: any) {
              console.error('Free describe-image also failed', e2);
              debugLog('describe_free_error', { message: e2?.message, stack: e2?.stack });
            }
          }

          setIsDescribing(false);

          if (description) {
            setChatMessages(prev => [...prev, `AI read: ${description}`]);
            finalPrompt = userMessage
              ? `${userMessage}\n\nWatch screen shows: ${description}`
              : `Watch screen shows: ${description}`;
          } else {
            setChatMessages(prev => [...prev, 'Could not read the image. Proceeding with your notes only.']);
          }
        }
      }

      setChatMessages(prev => [...prev, 'Analyzing your activity...']);

      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('prompt', finalPrompt);
      formData.append('planId', selectedPlan.id);
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }

      const analyzeUrl = `/api/users/me/daily-entries/${encodeURIComponent(getTodayStr())}/analyze`;
      debugLog('analyze_start', { url: analyzeUrl, hasImage: !!uploadedImage, promptLength: finalPrompt?.length });

      const res = await fetchWithRetry(
        analyzeUrl,
        { method: 'POST', body: formData },
        2,
        debugLog
      );

      debugLog('analyze_result', { ok: res.ok, status: res.status, statusText: res.statusText });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatMessages(prev => [...prev, 'Extracted metrics from your activity']);
          const changes = data.metricChanges || [];
          let responseText = '';
          if (changes.length > 0) {
            setChatMessages(prev => [...prev, 'Updated metrics:']);
            changes.forEach((c: { type: string; action: string; newValue: number; newUnit?: string }) => {
              const msg = `  • ${c.type}: ${c.newValue}${c.newUnit ? ' ' + c.newUnit : ''}`;
              setChatMessages(prev => [...prev, msg]);
              responseText += msg + '\n';
            });
          } else {
            setChatMessages(prev => [...prev, 'No metrics found']);
            responseText = 'No metrics found.';
          }
          setChatMessages(prev => [...prev, 'Saved to today\'s entry']);
          setNotesHistory(prev => [...prev, { role: 'assistant', content: responseText || 'Metrics updated successfully.' }]);
          await fetchData();
          setChatMessages(prev => [...prev, 'All done! Metrics updated.']);
        } else {
          const errorMsg = 'Failed to extract metrics.';
          setChatMessages(prev => [...prev, errorMsg]);
          setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        }
      } else {
        const errorMsg = 'Server error. Retrying failed — please try again.';
        setChatMessages(prev => [...prev, errorMsg]);
        setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        debugLog('analyze_error', { status: res.status, statusText: res.statusText });
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMsg = 'Network error. Retrying failed — check your connection.';
      setChatMessages(prev => [...prev, errorMsg]);
      setNotesHistory(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      const serialized = e instanceof Error
        ? { message: e.message, name: e.name, stack: e.stack }
        : { raw: JSON.stringify(e, Object.getOwnPropertyNames(e)) };
      debugLog('catch_error', serialized);
    } finally {
      setIsExtracting(false);
      clearUploadedImage();
    }
  };

  const planDay = getPlanDay(selectedPlan?.startDate ?? null);
  const totalDays = getPlanTotalDays(selectedPlan?.startDate ?? null, selectedPlan?.endDate ?? null);

  const getMetric = (type: string) => todayMetrics.find(m => m.type === type);
  const distance = getMetric('distance');
  const pace = getMetric('pace');
  const totalTime = getMetric('totalTime');
  const weight = getMetric('weight');

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

  const weightBarHeights = toWeightChartHeights(weightsKg);
  const weightGoal = parseWeightGoalFromPrompt(selectedPlan?.prompt ?? '');

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
              {isLoading ? (
                <Skeleton className="w-32 h-8" />
              ) : (
                <span className="text-xl sm:text-2xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-hanalei-fill)', color: activePalette.text }}>
                  SYNAPSE
                </span>
              )}
            </div>
          </div>

          {/* Header Row 2 */}
          <div className="flex w-full h-[6%]">
            <div className="w-1/2 h-full flex items-center justify-center px-3">
              {isLoading ? (
                <Skeleton className="w-24 h-6" />
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-light tabular-nums" style={{ color: activePalette.text }}>
                  {now.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
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
                  style={{ color: activePalette.text }}
                >
                  {plans.filter(p => p.status === 'IN_PROGRESS').length === 0
                    ? <option value="">No Active Plans</option>
                    : plans.filter(p => p.status === 'IN_PROGRESS').map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                  }
                </select>
              )}
            </div>
          </div>

          {/* Row 3 — ACTIVITY + day */}
          <div className="flex w-full h-[9.61%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderTop: `1px solid ${activePalette.border}`, borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-24 h-6" /> : (
                <span className="text-xl sm:text-2xl font-light" style={{ color: activePalette.text }}>ACTIVITY</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center" style={{ borderTop: `1px solid ${activePalette.border}`, borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-28 h-8" /> : (
                <span className="font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: 'calc((100vh * 0.95 * 0.0961) * 0.806)', lineHeight: 1, color: activePalette.text }}>
                  DAY {planDay}
                </span>
              )}
            </div>
          </div>

          {/* Row 4 — Distance */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-16 h-4" /> : (
                <span className="text-base font-light" style={{ color: activePalette.text }}>Distance</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayDistance
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: activePalette.text }}>{displayDistance.value}</span>
                      <span className="text-xs ml-1" style={{ color: activePalette.textSecondary }}>{displayDistance.unit ?? 'km'}</span>
                      {!distance && <span className="text-[8px] ml-1" style={{ color: activePalette.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: activePalette.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 5 — Pace */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-12 h-4" /> : (
                <span className="text-base font-light" style={{ color: activePalette.text }}>Pace</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayPace
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: activePalette.text }}>
                        {displayPace.unit?.includes('second') ? formatPace(displayPace.value) : displayPace.value}
                      </span>
                      <span className="text-xs ml-1" style={{ color: activePalette.textSecondary }}>/km</span>
                      {!pace && <span className="text-[8px] ml-1" style={{ color: activePalette.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: activePalette.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 6 — Total Time */}
          <div className="flex w-full h-[5.72%]">
            <div className="w-1/2 h-full flex items-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-20 h-4" /> : (
                <span className="text-base font-light" style={{ color: activePalette.text }}>Total Time</span>
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center px-3" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-20 h-5" /> : (
                displayTime
                  ? <div className="text-center w-full">
                      <span className="text-xl font-light" style={{ color: activePalette.text }}>
                        {displayTime.unit?.includes('second') ? formatSeconds(Math.round(displayTime.value)) : displayTime.value}
                      </span>
                      {!totalTime && <span className="text-[8px] ml-1" style={{ color: activePalette.textMuted }}>last</span>}
                    </div>
                  : <span className="text-sm" style={{ color: activePalette.textMuted }}>—</span>
              )}
            </div>
          </div>

          {/* Row 7 — Charts */}
          <div className="flex w-full h-[12.93%]">
            <div className="w-1/2 h-full flex flex-col p-2 overflow-hidden" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] mb-1" style={{ color: activePalette.textSecondary }}>
                    <span>Day 1</span>
                    <span style={{ color: activePalette.distance }}>DIST</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1 flex">
                    <div className="w-7 flex flex-col justify-between pr-1 flex-shrink-0">
                      {distanceValuesKm.filter(v => v > 0).length > 0 ? (
                        (() => {
                          const nonZero = distanceValuesKm.filter(v => v > 0);
                          const max = Math.max(...nonZero);
                          const maxCeil = Math.ceil(max * 1.1);
                          return [maxCeil, Math.round(maxCeil * 0.75), Math.round(maxCeil * 0.5), Math.round(maxCeil * 0.25), 0].map((val, idx) => (
                            <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                              {val}
                            </div>
                          ));
                        })()
                      ) : (
                        [15, 11, 7, 4, 0].map((val, idx) => (
                          <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex-1">
                      <BarChart
                        data={activityBarData}
                        color={activePalette.distance}
                        activeBarCount={planDay}
                        inactiveColor={activePalette.borderSoft}
                        showConnectingLine
                        connectingLineColor={activePalette.textMuted}
                        connectingLineWidth={1}
                        showCurrentDayArrow
                        currentDayArrowColor={activePalette.distance}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-1/2 h-full flex flex-col p-2 relative overflow-hidden" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-full h-full" /> : (
                <>
                  <div className="flex justify-between text-[9px] mb-1" style={{ color: activePalette.textSecondary }}>
                    <span>Day 1</span>
                    <span style={{ color: activePalette.primary }}>WEIGHT</span>
                    <span>Day {totalDays}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    <div className="w-7 flex flex-col justify-between pr-1 flex-shrink-0">
                      {weightsKg.length > 0 ? (
                        (() => {
                          const min = Math.min(...weightsKg);
                          const max = Math.max(...weightsKg);
                          const range = max - min;
                          const displayRange = Math.max(range, 5);
                          const mid = (min + max) / 2;
                          const hi = mid + displayRange / 2;
                          const lo = mid - displayRange / 2;
                          return [hi, hi - (hi - lo) * 0.25, mid, lo + (hi - lo) * 0.25, lo].map((val, idx) => (
                            <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                              {val.toFixed(1)}
                            </div>
                          ));
                        })()
                      ) : (
                        [80, 75, 70, 65, 60].map((val, idx) => (
                          <div key={idx} className="text-[7px] font-medium text-right leading-none" style={{ color: activePalette.textSecondary }}>
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <BarChart
                        data={weightBarHeights}
                        color={activePalette.primary}
                        showConnectingLine
                        connectingLineColor={activePalette.textMuted}
                        connectingLineWidth={1}
                        connectingLineShadow="rgba(239,233,233,0.49)"
                        activeBarCount={planDay}
                        inactiveColor={activePalette.borderSoft}
                        showCurrentDayArrow
                        currentDayArrowColor={activePalette.primary}
                      />
                      <div className="absolute bottom-0 right-1">
                        <span className="text-sm font-light" style={{ color: activePalette.text }}>
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
                        <div className="absolute top-0 right-1 text-[9px]" style={{ color: activePalette.textSecondary }}>
                          →{weightGoal.goalWeight}kg
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 8 — Live clock */}
          <div className="flex w-full h-[17.85%]">
            <div className="w-[28.36%] h-full flex items-center justify-center" style={{ borderBottom: `1px solid ${activePalette.border}`, borderRight: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-12 h-8" /> : (
                <span className="text-3xl sm:text-4xl font-light" style={{ color: activePalette.text }}>{dayName}</span>
              )}
            </div>
            <div className="w-[71.64%] h-full flex items-center justify-center gap-2" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
              {isLoading ? <Skeleton className="w-32 h-16" /> : (
                <>
                  <span className="text-5xl sm:text-6xl font-light tabular-nums" style={{ color: activePalette.text }}>{clockTime}</span>
                  <span className="text-xl sm:text-2xl" style={{ color: activePalette.textSecondary }}>{clockAmPm}</span>
                </>
              )}
            </div>
          </div>

          {/* Row 9 — progress bar */}
          <div className="w-full h-[5.26%] flex items-center px-3 gap-1" style={{ borderBottom: `1px solid ${activePalette.border}` }}>
            {isLoading ? <Skeleton className="w-full h-3 rounded-full" /> : (
              <>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: activePalette.borderSoft }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (planDay / totalDays) * 100)}%`, backgroundColor: activePalette.primary }}
                  />
                </div>
                <span className="text-[9px] whitespace-nowrap flex-shrink-0" style={{ color: activePalette.textSecondary }}>
                  {planDay}/{totalDays}d
                </span>
              </>
            )}
          </div>

          {/* Row 10 — Insights */}
          <div ref={scrollRef} className="w-full flex-1 flex flex-col p-3 overflow-y-auto scrollbar-thin scroll-fade-edges">
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold tracking-wider" style={{ color: activePalette.primary }}>
                    INSIGHTS & TIPS
                  </h4>
                  <span className="text-[9px]" style={{ color: activePalette.textMuted }}>
                    AI Analysis
                  </span>
                </div>
                
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
                  
                  let motivation = '';
                  let analysis = '';
                  let recommendation = '';
                  
                  if (activeDays === 0) {
                    motivation = 'Ready to start strong?';
                    analysis = 'No activities logged this week yet. Every journey begins with a single step!';
                    recommendation = 'Start with a light 3-5km run today to build momentum.';
                  } else if (activeDays >= 5) {
                    motivation = 'Outstanding consistency!';
                    analysis = `${activeDays} active days this week! You are building an incredible routine.`;
                    recommendation = 'Keep this momentum while ensuring proper recovery days.';
                  } else if (activeDays >= 3) {
                    motivation = 'Strong effort this week!';
                    analysis = `${activeDays} workouts completed. You are on the right track!`;
                    recommendation = 'Try adding one more session this week for even better results.';
                  } else {
                    motivation = 'Time to level up!';
                    analysis = `${activeDays} ${activeDays === 1 ? 'session' : 'sessions'} so far. There is room to push harder!`;
                    recommendation = 'Aim for 3-4 sessions next week for optimal progress.';
                  }
                  
                  if (progressPercent >= 75) {
                    motivation = 'Final stretch ahead!';
                    analysis = `You are ${progressPercent}% through your plan. The finish line is in sight!`;
                    recommendation = 'Stay focused and maintain your routine to finish strong.';
                  } else if (progressPercent >= 50) {
                    motivation = 'Halfway there!';
                    analysis = `${progressPercent}% complete! You have built solid momentum.`;
                    recommendation = 'This is where habits become permanent. Keep going!';
                  }
                  
                  if (weightGoal.goalWeight && weight) {
                    const diff = weight.value - weightGoal.goalWeight;
                    if (Math.abs(diff) <= 2) {
                      motivation = 'Almost at goal weight!';
                      analysis = `Just ${Math.abs(diff).toFixed(1)}kg away from your target!`;
                      recommendation = 'Maintain consistency - you are so close!';
                    }
                  }
                  
                  return (
                    <div className="flex-1 space-y-3 text-xs" style={{ color: activePalette.text }}>
                      <div className="leading-relaxed">
                        <p className="font-bold mb-1" style={{ color: activePalette.primary }}>
                          {motivation}
                        </p>
                        <p style={{ color: activePalette.textSecondary }}>
                          {analysis}
                        </p>
                      </div>
                      <div className="leading-relaxed pt-2 border-t" style={{ borderColor: activePalette.border }}>
                        <p className="font-medium mb-1" style={{ color: activePalette.text }}>
                          Recommendation
                        </p>
                        <p style={{ color: activePalette.textSecondary }}>
                          {recommendation}
                        </p>
                      </div>
                      {totalDistance > 0 && (
                        <div className="leading-relaxed pt-2 border-t" style={{ borderColor: activePalette.border }}>
                          <p style={{ color: activePalette.textMuted, fontSize: '10px' }}>
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

          {showAIModal && (
            <div className="absolute inset-x-3 bottom-3 z-30 overflow-hidden rounded-xl border" style={{ backgroundColor: activePalette.panel, borderColor: activePalette.borderSoft }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: activePalette.border }}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-hanalei-fill)', color: activePalette.text }}>
                    Activity Logger
                  </h3>
                  <div className="relative" style={(isExtracting || isDescribing) ? { pointerEvents: 'none', opacity: 0.4 } : undefined}>
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors animate-pulse pointer-events-none"
                      style={{ color: '#ffffff', boxShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.2)' }}
                      aria-label="Upload from gallery"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <div className="relative" style={(isExtracting || isDescribing) ? { pointerEvents: 'none', opacity: 0.4 } : undefined}>
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors animate-pulse pointer-events-none"
                      style={{ color: '#ffffff', boxShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.2)' }}
                      aria-label="Take photo with camera"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      ref={cameraInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                {isDescribing && (
                  <span className="text-[10px]" style={{ color: activePalette.textSecondary }}>
                    Reading watch screen...
                  </span>
                )}
              </div>
              <div className="pb-3">
                {imagePreview && (
                  <div className="px-4 pt-2 pb-1.5">
                    <div className="relative inline-block rounded-lg overflow-hidden border max-w-full" style={{ borderColor: activePalette.borderSoft }}>
                      <img src={imagePreview} alt="Watch screen" className="max-h-14 w-auto max-w-full object-contain" />
                      <button
                        onClick={clearUploadedImage}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs leading-none hover:bg-red-600 transition-colors"
                        disabled={isExtracting || isDescribing}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                <PromptBoxOpenAI
                  value={notesInput}
                  onChange={setNotesInput}
                  onEnterPressed={handleSendToAI}
                  onClose={() => setShowAIModal(false)}
                  placeholder="Log your activities and I'll extract the metrics..."
                  isLoading={isExtracting || isDescribing}
                  thinkingMessages={chatMessages}
                  showChat
                  chatHeight={180}
                  imageAttached={!!uploadedImage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Internal links for SEO */}
      <nav className="sr-only" aria-label="Internal navigation">
        <a href="/">Home</a>
        <a href="/planner">Workout Planner</a>
        <a href="/workout-tracker">Workout Tracker</a>
        <a href="/blog">Fitness Blog</a>
      </nav>

      <FloatingNavBar onAIClick={() => setShowAIModal(true)} />
    </div>
  );
}

export default function MonitorPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-[#0b0b0b] flex items-center justify-center">
        <Skeleton className="w-40 h-10 rounded" />
      </div>
    }>
      <MonitorContent />
    </Suspense>
  );
}
