'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';

const SYNAPSE_BACKEND_URL = "https://moole-back.vercel.app";

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

const WorkoutGoalsSection = ({
  planData,
  selectedDay,
  onDayChange,
  onMuscleUpdate,
  gender,
  onGenderChange,
}: {
  planData: { id: string | number; columns: string[] }[];
  selectedDay: number;
  onDayChange: (day: number) => void;
  onMuscleUpdate?: (muscles: string[]) => void;
  gender: 'male' | 'female';
  onGenderChange: (g: 'male' | 'female') => void;
}) => {
  const currentRow = planData[selectedDay];
  const exercises = currentRow
    ? (currentRow.columns[2] || '').split('\n').filter(Boolean).map((line: string) => {
        const parts = line.split(':');
        const name = parts[0]?.trim() || line.trim();
        const setsReps = parts.slice(1).join(':').trim() || '';
        return { name, setsReps };
      })
    : [];

  const dayNames = planData.map((row: any) => row.columns[0] || '');

  const goToPrevDay = () => onDayChange(Math.max(0, selectedDay - 1));
  const goToNextDay = () => onDayChange(Math.min(planData.length - 1, selectedDay + 1));

  // Extract muscle groups from current day's exercises
  useEffect(() => {
    if (!currentRow || !onMuscleUpdate) return;
    const exerciseStr = currentRow.columns[2] || '';
    const lines = exerciseStr.split('\n').filter(Boolean);
    const muscles = new Set<string>();

    const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
      'bench press': ['chest', 'triceps', 'front-delts'],
      'incline': ['chest', 'front-delts'],
      'fly': ['chest'],
      'push up': ['chest', 'triceps', 'front-delts'],
      'chest': ['chest'],
      'pull up': ['lats', 'biceps', 'upper-back'],
      'row': ['lats', 'upper-back', 'biceps'],
      'lat pulldown': ['lats', 'biceps'],
      'deadlift': ['lower-back', 'glutes', 'hamstrings', 'traps'],
      'back': ['lats', 'upper-back'],
      'overhead press': ['shoulders', 'triceps'],
      'lateral raise': ['shoulders'],
      'front raise': ['front-delts'],
      'shoulder press': ['shoulders', 'triceps'],
      'shoulder': ['shoulders'],
      'curl': ['biceps'],
      'bicep': ['biceps'],
      'tricep': ['triceps'],
      'skull crusher': ['triceps'],
      'pushdown': ['triceps'],
      'squat': ['quads', 'glutes', 'adductors'],
      'leg press': ['quads', 'glutes', 'hamstrings'],
      'lunge': ['quads', 'glutes', 'hamstrings'],
      'leg extension': ['quads'],
      'leg curl': ['hamstrings'],
      'crunch': ['abs'],
      'plank': ['abs'],
      'leg raise': ['abs'],
      'ab': ['abs'],
      'calf raise': ['calves'],
      'calf': ['calves'],
    };

    lines.forEach(line => {
      const name = line.split(':')[0]?.trim().toLowerCase() || '';
      for (const [keyword, muscleGroups] of Object.entries(EXERCISE_MUSCLE_MAP)) {
        if (name.includes(keyword)) {
          muscleGroups.forEach(m => muscles.add(m));
        }
      }
    });

    onMuscleUpdate(Array.from(muscles));
  }, [selectedDay, planData]);

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 pt-12 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex items-center justify-end mb-1 flex-shrink-0 gap-2">
        <button
          onClick={() => {
            const pid = new URLSearchParams(window.location.search).get('planId');
            if (pid) navigator.clipboard.writeText(`${window.location.origin}/workout-tracker?planId=${pid}`);
          }}
          className="p-1 text-gray-500 hover:text-white transition-colors"
          aria-label="Share plan"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <h2 className="text-white font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '19px', lineHeight: '1' }}>
          TODAY'S PLAN
        </h2>
      </div>
      <div className="flex items-center justify-end mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-medium transition-colors ${gender === 'male' ? 'text-white' : 'text-gray-600'}`}>Men</span>
          <button
            onClick={() => onGenderChange(gender === 'male' ? 'female' : 'male')}
            className="w-7 h-3.5 rounded-full bg-gray-700 relative transition-colors cursor-pointer"
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${gender === 'female' ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-[9px] font-medium transition-colors ${gender === 'female' ? 'text-white' : 'text-gray-600'}`}>Women</span>
        </div>
      </div>

      {currentRow && (
        <div className="mb-2 flex-shrink-0">
          <h3 className="text-white text-xs font-semibold">
            {currentRow.columns[0]}: {currentRow.columns[1]}
          </h3>
          {currentRow.columns[3] && (
            <p className="text-gray-500 text-[10px]">{currentRow.columns[3]}</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 mb-2">
        {exercises.length > 0 ? (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-900/50">
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium py-2 px-3">Exercise</th>
                  <th className="text-left text-gray-400 font-medium py-2 px-3">Sets x Reps</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex: { name: string; setsReps: string }, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors last:border-b-0">
                    <td className="text-white py-2 px-3 font-medium">{ex.name}</td>
                    <td className="text-gray-300 py-2 px-3">{ex.setsReps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No exercises for this day
          </div>
        )}
      </div>

      {dayNames.length > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800 flex-shrink-0">
          <button onClick={goToPrevDay} disabled={selectedDay === 0}
            className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous day">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex gap-1 flex-1 overflow-x-auto justify-center hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {dayNames.map((name: string, index: number) => (
              <button key={index} onClick={() => onDayChange(index)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                  index === selectedDay ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
          <button onClick={goToNextDay} disabled={selectedDay === planData.length - 1}
            className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next day">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default function WorkoutTrackerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState<{ id: string | number; columns: string[] }[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachAdvice, setCoachAdvice] = useState('');
  const [coachAdviceLoading, setCoachAdviceLoading] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const coachTipsCache = useRef<Record<number, string>>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [videoSearching, setVideoSearching] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const baseWidth = 402;
  const baseHeight = 874;
  const row1Height = planData.length > 0 ? 370 : 340;
  

  // Load active plan on mount
  useEffect(() => {
    setMounted(true);
    const loadActivePlan = async () => {
      try {
        const userStr = localStorage.getItem('synapse_user');
        const user = userStr ? JSON.parse(userStr) : null;

        const planId = new URLSearchParams(window.location.search).get('planId');

        // If a specific planId is provided, load that plan
        if (planId) {
          const res = await fetch(`/api/plans/${planId}`);
          if (res.ok) {
            const data = await res.json();
            const rows = data.plan?.tables?.[0]?.rows;
            const planOwnerEmail = data.plan?.user?.email;
            if (planOwnerEmail && user?.email) {
              setIsOwner(planOwnerEmail === user.email);
            } else {
              setIsOwner(false);
            }
            if (rows?.length) { setPlanData(rows); setAuthChecked(true); setIsLoading(false); return; }
          }
        }

        // If logged in, find active workout plan
        if (user?.email) {
          const res = await fetch(`/api/plans?userEmail=${encodeURIComponent(user.email)}`);
          const data = await res.json();
          const plans: any[] = data.plans || [];
          const active = plans.find(
            (p: any) => p.status === 'IN_PROGRESS' && p.tables?.some((t: any) => t.title === 'WORKOUT PLAN')
          );
          if (active?.tables?.[0]?.rows) {
            setPlanData(active.tables[0].rows);
            setIsOwner(true);
          }
        }
      } catch (e) {
        console.error('Error loading active plan:', e);
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };
    loadActivePlan();
  }, [router]);

  // Generate coach advice when day changes
  useEffect(() => {
    if (!planData.length || !planData[selectedDay]) return;
    const cached = coachTipsCache.current[selectedDay];
    if (cached) { setCoachAdvice(cached); return; }
    const currentRow = planData[selectedDay];
    const fetchAdvice = async () => {
      setCoachAdviceLoading(true);
      try {
        const context = `${currentRow.columns[0] || ''}: ${currentRow.columns[1] || ''}\n${(currentRow.columns[2] || '').split('\n').filter(Boolean).join('\n')}`;
        // Use analyse route which has OpenRouter fallback
        const res = await fetch('/api/ai/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: `You are a motivating fitness coach. Based on today's exercises below, identify the target muscles and give a very short (1-2 sentences, max 30 words) coaching tip with form advice. Keep it extremely concise. Today's workout:\n${context}`
          })
        });
        const data = await res.json();
        const advice = data?.answer?.trim();
        if (advice) { coachTipsCache.current[selectedDay] = advice; setCoachAdvice(advice); setCoachAdviceLoading(false); return; }
      } catch (e) {}
      const exercises = (currentRow.columns[2] || '').split('\n').filter(Boolean);
      const focus = currentRow.columns[1] || 'Workout';
      const fallback = `Today targets ${focus.toLowerCase()}. Focus on controlled reps and proper form for each exercise — quality over weight.`;
      coachTipsCache.current[selectedDay] = fallback;
      setCoachAdvice(fallback);
      setCoachAdviceLoading(false);
    };
    fetchAdvice();
  }, [selectedDay, planData]);

  const handleOpenChat = () => setShowChat(true);
  const handleCloseChat = () => setShowChat(false);

  const playExerciseVideo = async (exerciseName: string) => {
    setVideoSearching(true);
    setShowVideo(false);
    console.log('[Video] Searching for:', exerciseName);
    try {
      const res = await fetch('/api/search/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${exerciseName} exercise form tutorial` }),
      });
      const data = await res.json();
      const videos: any[] = data.videos || [];
      console.log('[Video] API response:', { status: res.status, count: videos.length, first: videos[0] ? { url: videos[0].url, title: videos[0].title } : null });
      const video = videos[0];
      const url = video?.url?.link || video?.link || '';
      console.log('[Video] Extracted URL:', url);
      if (url) {
        setVideoUrl(url);
        const title = (video.title || exerciseName).replace(/&amp;/g, '&');
        setVideoTitle(title);
        setShowVideo(true);
        console.log('[Video] Player opened for:', title);
      } else {
        console.warn('[Video] No URL found in response');
      }
    } catch (e) {
      console.error('[Video] Search error:', e);
    } finally {
      setVideoSearching(false);
    }
  };

  const handleCoachAsk = async () => {
    if (!coachPrompt.trim()) return;
    setShowChat(true);
    const userMsg = `User: ${coachPrompt}`;
    setChatMessages(prev => [...prev, userMsg]);
    const thinkingMsg = 'AI: Thinking...';
    setChatMessages(prev => [...prev, thinkingMsg]);

    try {
      const context = planData.map((row, i) =>
        `${row.columns[0]}: ${row.columns[1]}\n${row.columns[2]}`
      ).join('\n\n');

      // Use /api/ai/analyse which has OpenRouter fallback if ask-moole fails
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `You are a motivating fitness coach. The user's workout plan is:\n${context}\n\nAnswer the user's question as a coach: ${coachPrompt}`
        }),
      });

      const data = await res.json();
      const reply = data?.answer || 'Sorry, I could not process that.';

      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== thinkingMsg);
        return [...filtered, `AI: ${reply}`];
      });
    } catch (e) {
      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== thinkingMsg);
        return [...filtered, 'AI: Sorry, something went wrong. Please try again.'];
      });
    }
    setCoachPrompt('');
  };

  const handleMuscleUpdate = useCallback((muscles: string[]) => {
    setSelectedMuscles(muscles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      <div className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{ width: `min(95vw, ${baseWidth}px)`, aspectRatio: baseWidth / baseHeight, maxHeight: '95vh' }}
      >
        {/* Muscle Map Background */}
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-auto">
          <MuscleMapDisplay
            key={gender}
            highlights={{
              muscles: selectedMuscles,
              fillColor: '#D20A0A',
              fillOpacity: 0.89,
              strokeColor: '#AB8585',
              strokeWidth: 0.8,
              blurInactive: 3,
              shadowColor: 'rgba(204,4,4,0.47)',
              shadowX: 13,
              shadowY: 16,
              shadowBlur: 24,
              shadowOpacity: 0.47,
            }}
            defaultGender={gender}
            showToggle={false}
          />
        </div>

        {/* Main Container */}
        <div className="w-full h-full flex flex-col relative z-10" style={{ backgroundColor: '#0b0b0b4D' }}>
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>

          {/* Row 1: Workout plan with day tabs */}
          <div className="w-full border border-[#3B3B3B00] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out"
            style={{ height: `${(row1Height / 874) * 100}%` }}
          >
            {isLoading ? (
              <Spinner size={36} />
            ) : planData.length > 0 ? (
              <WorkoutGoalsSection planData={planData} selectedDay={selectedDay} onDayChange={setSelectedDay} onMuscleUpdate={handleMuscleUpdate} gender={gender} onGenderChange={setGender} />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 text-sm gap-3">
                <span>No active workout plan</span>
                <button
                  onClick={() => router.push('/workout-planner')}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:opacity-90"
                >
                  Create one
                </button>
              </div>
            )}
          </div>

          {/* Middle: Videos + Coach Tip */}
          {planData.length > 0 && (
            <div className="flex-1 flex flex-col min-h-0 px-3 pb-3">
              {showChat ? (
                <div className="flex-1 flex items-end justify-center z-20">
                  <div className="w-full">
                    <PromptBoxOpenAI
                      value={coachPrompt}
                      onChange={setCoachPrompt}
                      onEnterPressed={handleCoachAsk}
                      onClose={handleCloseChat}
                      placeholder="Ask your AI coach anything..."
                      thinkingMessages={chatMessages}
                      showChat={showChat}
                      chatHeight={242}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Coach Tip - upper area */}
                  {!showChat && (
                    <div
                      onClick={coachAdvice && !coachAdviceLoading ? handleOpenChat : undefined}
                      className={`w-full rounded-2xl p-3 mb-3 flex-shrink-0 transition-all duration-200 ${coachAdvice && !coachAdviceLoading ? 'cursor-pointer active:scale-95' : ''}`}
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        maxHeight: '140px',
                      }}
                    >
                      {coachAdviceLoading ? (
                        <div className="flex items-center gap-3 py-1">
                          <Spinner size={18} />
                          <span className="text-[12px] text-gray-400">Coach is thinking...</span>
                        </div>
                      ) : coachAdvice ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <img src="/vectors/ai-icon.svg" alt="AI" className="w-4 h-4" />
                            <span className="text-white font-semibold text-sm">Coach Tip</span>
                          </div>
                          <p className="text-[13px] opacity-60 text-gray-300 leading-relaxed">{coachAdvice}</p>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Video section */}
                  {selectedDay < planData.length && (
                    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto border border-[#3B3B3B00]">
                      {showVideo && videoUrl ? (
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0">
                            <button onClick={() => setShowVideo(false)}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              aria-label="Back to video list">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5m7-7l-7 7 7 7" />
                              </svg>
                            </button>
                            <span className="text-[11px] text-gray-400 truncate">{videoTitle}</span>
                          </div>
                          <div className="flex-1 relative overflow-hidden px-3 pb-2" style={{ backgroundColor: '#000' }}>
                            <iframe
                              src={(() => {
                                try {
                                  const urlObj = new URL(videoUrl);
                                  console.log('[Video] Parsing URL:', { hostname: urlObj.hostname, pathname: urlObj.pathname, params: Object.fromEntries(urlObj.searchParams) });
                                  let vid = null;
                                   if (urlObj.hostname === 'youtu.be') {
                                     vid = urlObj.pathname.slice(1);
                                   } else if (urlObj.hostname.includes('youtube.com')) {
                                     vid = urlObj.searchParams.get('v');
                                   }
                                   if (vid) {
                                     const embed = new URL(`https://www.youtube.com/embed/${vid}`);
                                     embed.searchParams.set('autoplay', '1');
                                     embed.searchParams.set('mute', '1');
                                     embed.searchParams.set('playsinline', '1');
                                     console.log('[Video] Embed URL:', embed.toString());
                                     return embed.toString();
                                   }
                                } catch (e) {
                                  console.error('[Video] URL parse error:', e);
                                }
                                console.warn('[Video] Falling back to raw URL:', videoUrl);
                                return videoUrl;
                              })()}
                              title={videoTitle}
                              className="w-full h-full rounded-xl"
                              allow="autoplay; encrypted-media; fullscreen"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                              style={{ border: 'none' }}
                              onError={() => setShowVideo(false)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 space-y-1.5">
                          <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Exercise Videos</span>
                          {videoSearching ? (
                            <div className="flex items-center gap-2 py-2">
                              <Spinner size={14} />
                              <span className="text-[11px] text-gray-500">Searching videos...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                            {(planData[selectedDay]?.columns[2] || '')
                            .split('\n').filter(Boolean)
                            .map((line: string, idx: number) => {
                              const name = line.split(':')[0]?.trim() || line.trim();
                              return (
                                <button
                                  key={name}
                                  onClick={() => playExerciseVideo(name)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/60 transition-colors text-left"
                                >
                                  <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="5 3 19 12 5 21 5 3" fill="#9ca3af" />
                                    </svg>
                                  </span>
                                  <span className="text-[11px] text-gray-300 flex-1">{name}</span>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                </button>
                              );
                            })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tap to chat */}
                  <div
                    onClick={handleOpenChat}
                    className="w-full flex items-center justify-start gap-1 py-1 mt-[20%] cursor-pointer active:scale-95 transition-all duration-200 flex-shrink-0"
                  >
                    <span className="text-[10px] text-gray-500">Tap to chat with your coach</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!showChat && isOwner && <FloatingNavBar onAIClick={handleOpenChat} />}

      {authChecked && !isOwner && planData.length > 0 && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[40px]">
          <div className="w-[80%] max-w-[320px] flex flex-col items-center gap-4 text-center">
            <img src="/vectors/ai-icon.svg" alt="" className="w-10 h-10 opacity-60" />
            <p className="text-white/80 text-sm font-medium">Sign in to access all features</p>
            <p className="text-gray-500 text-xs">Chat with your coach, save progress, and personalize your workout experience</p>
            <button
              onClick={() => signIn()}
              className="mt-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
