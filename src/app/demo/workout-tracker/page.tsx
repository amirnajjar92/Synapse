'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';
import { MOCK_PLAN, MOCK_MESSAGES_BY_CLIENT } from '@/lib/screenshot-data';

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
  anatomyView,
  onAnatomyViewChange,
}: {
  planData: { id: string | number; columns: string[] }[];
  selectedDay: number;
  onDayChange: (day: number) => void;
  onMuscleUpdate?: ((muscles: string[]) => void) | undefined;
  gender: 'male' | 'female';
  onGenderChange: (g: 'male' | 'female') => void;
  anatomyView: 'front' | 'back';
  onAnatomyViewChange: (v: 'front' | 'back') => void;
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
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 pt-12 transition-all duration-300 ease-out">
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
      <div className="flex flex-col items-end mb-2 flex-shrink-0 gap-1">
        <div className="flex items-center gap-1.5 w-[104px] justify-between">
          <span className={`text-[9px] font-medium transition-colors ${gender === 'male' ? 'text-white' : 'text-gray-600'}`}>Men</span>
          <button
            onClick={() => onGenderChange(gender === 'male' ? 'female' : 'male')}
            className="w-7 h-3.5 rounded-full bg-gray-700 relative transition-colors cursor-pointer flex-shrink-0"
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${gender === 'female' ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-[9px] font-medium transition-colors ${gender === 'female' ? 'text-white' : 'text-gray-600'}`}>Women</span>
        </div>
        <div className="flex items-center gap-1.5 w-[104px] justify-between">
          <span className={`text-[9px] font-medium transition-colors ${anatomyView === 'front' ? 'text-white' : 'text-gray-600'}`}>Front</span>
          <button
            onClick={() => onAnatomyViewChange(anatomyView === 'front' ? 'back' : 'front')}
            className="w-7 h-3.5 rounded-full bg-gray-700 relative transition-colors cursor-pointer flex-shrink-0"
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${anatomyView === 'back' ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-[9px] font-medium transition-colors ${anatomyView === 'back' ? 'text-white' : 'text-gray-600'}`}>Back</span>
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

export default function WorkoutTrackerDemo() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [planData, setPlanData] = useState<{ id: string | number; columns: string[] }[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachAdvice, setCoachAdvice] = useState('');
  const [coachAdviceLoading, setCoachAdviceLoading] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [anatomyView, setAnatomyView] = useState<'front' | 'back'>('front');
  const coachTipsCache = useRef<Record<number, string>>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [videoSearching, setVideoSearching] = useState(false);

  // Trainer chat
  const [showTrainerChat, setShowTrainerChat] = useState(false);
  const [trainerConvs, setTrainerConvs] = useState<any[]>([]);
  const [activeTrainerIdx, setActiveTrainerIdx] = useState(0);
  const [trainerChatText, setTrainerChatText] = useState('');
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressFiredRef = useRef(false);
  const trainerChatRef = useRef<HTMLDivElement>(null);

  const baseWidth = 402;
  const baseHeight = 874;
  const row1Height = planData.length > 0 ? 370 : 340;
  
  // DEMO MODE: Load mock data on mount
  useEffect(() => {
    setMounted(true);
    const rows = MOCK_PLAN.tables[0].rows;
    setPlanData(rows);
    setTrainerConvs([{
      trainer: { id: 'trainer-1', name: 'Coach Alex', email: 'alex@synapse.app' },
      conversationId: 'conv-1',
      messages: MOCK_MESSAGES_BY_CLIENT['client-1'],
    }]);
    
    // Set a mock coach tip after short delay
    setTimeout(() => {
      setCoachAdvice('Today targets chest and shoulders. Focus on controlled reps and proper form — quality over weight.');
    }, 800);
  }, []);

  const unreadCount = 0; // Demo: no unread

  const handleOpenTrainerChat = () => setShowTrainerChat(true);
  const handleCloseTrainerChat = () => setShowTrainerChat(false);

  const handleSendTrainerMsg = () => {
    const text = trainerChatText.trim();
    if (!text || trainerConvs.length === 0) return;

    const newMsg: any = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: null,
      text,
      timestamp: new Date().toISOString(),
    };

    setTrainerConvs((prev: any[]) => {
      const updated = [...prev];
      updated[activeTrainerIdx] = {
        ...updated[activeTrainerIdx],
        messages: [...updated[activeTrainerIdx].messages, newMsg],
      };
      return updated;
    });
    setTrainerChatText('');
  };

  const handleDeleteTrainerMsg = (messageId: string) => {
    setDeletingMsgId(null);
    setTrainerConvs((prev: any[]) => {
      const updated = [...prev];
      updated[activeTrainerIdx] = {
        ...updated[activeTrainerIdx],
        messages: updated[activeTrainerIdx].messages.filter((m: any) => m.id !== messageId),
      };
      return updated;
    });
  };

  // Scroll trainer chat to bottom
  useEffect(() => {
    if (trainerChatRef.current) {
      trainerChatRef.current.scrollTop = trainerChatRef.current.scrollHeight;
    }
  }, [trainerConvs, activeTrainerIdx]);

  const handleOpenChat = () => setShowChat(true);
  const handleCloseChat = () => setShowChat(false);

  const playExerciseVideo = (exerciseName: string) => {
    // Demo: just show a placeholder
    setVideoSearching(true);
    setTimeout(() => {
      setVideoUrl('https://www.youtube.com/watch?v=rT7DgCr-3pg');
      setVideoTitle(`${exerciseName} - Form Tutorial`);
      setShowVideo(true);
      setVideoSearching(false);
    }, 500);
  };

  const handleCoachAsk = () => {
    if (!coachPrompt.trim()) return;
    setShowChat(true);
    const userMsg = `User: ${coachPrompt}`;
    setChatMessages(prev => [...prev, userMsg]);
    const thinkingMsg = 'AI: Thinking...';
    setChatMessages(prev => [...prev, thinkingMsg]);

    // Mock response
    setTimeout(() => {
      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== thinkingMsg);
        return [...filtered, 'AI: Great question! For chest days, focus on squeezing at the top of each rep and controlling the descent. This maximizes time under tension.'];
      });
    }, 1000);
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
            key={`${gender}-${anatomyView}`}
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
            view={anatomyView}
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
            {planData.length > 0 && (
              <WorkoutGoalsSection planData={planData} selectedDay={selectedDay} onDayChange={setSelectedDay} onMuscleUpdate={handleMuscleUpdate} gender={gender} onGenderChange={setGender} anatomyView={anatomyView} onAnatomyViewChange={setAnatomyView} />
            )}
          </div>

          {/* Trainer chat button - between workout plan and videos */}
          {trainerConvs.length > 0 && (
            <div className="px-3 py-1 flex-shrink-0">
              <button onClick={handleOpenTrainerChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <span className="text-[10px] text-white/70">Chat with Trainer</span>
                {unreadCount > 0 && (
                  <span className="ml-auto w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Middle: Videos + Coach Tip */}
          {planData.length > 0 && (
            <div className="flex-1 flex flex-col min-h-0 px-3 pb-3">
              {showTrainerChat ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      <span className="text-white font-semibold text-sm">Chat with Trainer</span>
                    </div>
                    <button onClick={handleCloseTrainerChat} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {trainerConvs.length > 1 && (
                    <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-none flex-shrink-0">
                      {trainerConvs.map((conv: any, i: number) => (
                        <button key={conv.trainer.id} onClick={() => setActiveTrainerIdx(i)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${i === activeTrainerIdx ? 'bg-[#FC4C02] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                          {conv.trainer.name || conv.trainer.email}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={trainerChatRef} className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {trainerConvs[activeTrainerIdx]?.messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center text-white/30 text-xs px-4">
                        No messages yet. Say hello!
                      </div>
                    ) : (
                      trainerConvs[activeTrainerIdx]?.messages.map((msg: any) => {
                        const isMe = msg.senderId === 'me';
                        const showDelete = isMe && deletingMsgId === msg.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 max-w-[85%]">
                              {showDelete && (
                                <button
                                  onClick={() => handleDeleteTrainerMsg(msg.id)}
                                  className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center flex-shrink-0 transition-colors"
                                  title="Delete message"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              )}
                              <div
                                className={`rounded-2xl px-3.5 py-2 text-xs ${isMe ? 'bg-[#FC4C02] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}
                                onContextMenu={e => { if (isMe) { e.preventDefault(); setDeletingMsgId(showDelete ? null : msg.id); } }}
                                onPointerDown={() => {
                                  if (!isMe) return;
                                  longPressFiredRef.current = false;
                                  longPressTimerRef.current = setTimeout(() => {
                                    longPressFiredRef.current = true;
                                    setDeletingMsgId(msg.id);
                                  }, 500);
                                }}
                                onPointerUp={() => { clearTimeout(longPressTimerRef.current); }}
                                onPointerLeave={() => { clearTimeout(longPressTimerRef.current); }}
                                onPointerCancel={() => { clearTimeout(longPressTimerRef.current); }}
                                onClick={() => { if (showDelete && !longPressFiredRef.current) setDeletingMsgId(null); }}
                              >
                                {msg.text}
                              </div>
                            </div>
                            <span className="text-[9px] text-white/30 mt-0.5 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex-shrink-0 pt-2 flex gap-2">
                    <input type="text" value={trainerChatText}
                      onChange={e => setTrainerChatText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendTrainerMsg(); }}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs placeholder-white/30 outline-none focus:border-white/20"
                    />
                    <button onClick={handleSendTrainerMsg} disabled={!trainerChatText.trim()}
                      className="w-9 h-9 rounded-xl bg-[#FC4C02] disabled:opacity-30 text-white flex items-center justify-center transition-opacity flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : showChat ? (
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
                      className={`w-full rounded-2xl p-3 mb-3 flex-shrink-0 transition-all duration-200 overflow-y-auto ${coachAdvice && !coachAdviceLoading ? 'cursor-pointer active:scale-95' : ''}`}
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
                                     return embed.toString();
                                   }
                                } catch (e) {
                                  console.error('[Video] URL parse error:', e);
                                }
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
                        <div className="px-4 py-3 space-y-1.5 overflow-y-auto">
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

      {!showChat && !showTrainerChat && <FloatingNavBar onAIClick={handleOpenChat} />}
    </div>
  );
}
