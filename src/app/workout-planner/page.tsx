'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import AnimatedLogo from '@/components/AnimatedLogo';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';
import useWorkoutPlanner from '@/lib/hooks/useWorkoutPlanner';
import { useAppDispatch } from '@/lib/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Google Identity Services type declaration
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const SYNAPSE_BACKEND_URL = "https://moole-back.vercel.app";

// Skeleton Component
const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

// Workout-specific goals display component (similar to GoalsSection)
  const WorkoutGoalsSection = ({ 
    prompt, 
    selectedMuscles,
    planData,
    isLoading = false,
    onMuscleUpdate,
}: { 
  prompt: string;
  selectedMuscles: string[];
  planData: { id: string | number; columns: string[] }[];
  isLoading?: boolean;
  onMuscleUpdate?: (muscles: string[]) => void;
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);

  // Extract muscle groups from current day's exercises
  useEffect(() => {
    if (!planData[selectedDay] || !onMuscleUpdate) return;
    const currentRow = planData[selectedDay];
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

  // Reset selectedDay when planData changes (e.g., new plan generated)
  useEffect(() => {
    if (planData.length > 0) {
      setSelectedDay(0);
    }
  }, [planData.length]);

  if (isLoading) {
    return <Spinner size={36} />;
  }

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

  const goToPrevDay = () => {
    setSelectedDay(prev => Math.max(0, prev - 1));
  };

  const goToNextDay = () => {
    setSelectedDay(prev => Math.min(planData.length - 1, prev + 1));
  };

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 md:p-6 pt-12 transition-all duration-300 ease-out overflow-hidden">
      {/* Title row at top, right-aligned, below burger button */}
      <div className="flex items-center justify-end mb-2 flex-shrink-0">
        <h2 
          className="text-white font-bold"
          style={{ 
            fontFamily: 'var(--font-hanalei-fill)', 
            fontSize: '19px',
            lineHeight: '1'
          }}
        >
          WORKOUT PLAN
        </h2>
      </div>

      {/* Selected Day Info */}
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

      {/* Exercises Table - fills all remaining space, scrolls if too tall */}
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

      {/* Day Tabs with prev/next - below the table */}
      {dayNames.length > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800 flex-shrink-0">
          {/* Previous button */}
          <button
            onClick={goToPrevDay}
            disabled={selectedDay === 0}
            className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Day tabs */}
          <div className="flex gap-1 flex-1 overflow-x-auto justify-center hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {dayNames.map((name: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                  index === selectedDay
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={goToNextDay}
            disabled={selectedDay === planData.length - 1}
            className="p-1.5 text-white hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default function WorkoutPlannerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { 
    isGenerating, 
    planGenerated, 
    planData,
    generateWorkoutPlan,
    saveWorkoutPlan,
    resetPlan 
  } = useWorkoutPlanner();
  
  const [localPromptText, setLocalPromptText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  
  // Authentication states
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testLoading, setTestLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if user is signed in on mount
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('synapse_token');
    if (token) {
      setIsSignedIn(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleMuscleClick = (muscleGroups: string[]) => {
    setSelectedMuscles(prev => {
      const newMuscles = [...prev];
      muscleGroups.forEach(muscle => {
        const index = newMuscles.indexOf(muscle);
        if (index > -1) {
          newMuscles.splice(index, 1);
        } else {
          newMuscles.push(muscle);
        }
      });
      return newMuscles;
    });
  };

  const handleGoClick = async () => {
    setShowChat(true);
    setChatMessages([]);
    
    // Add user message
    setChatMessages((prev) => [...prev, `User: ${localPromptText}`]);
    
    // Add thinking message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Analyzing your fitness goals...']);
    }, 300);
    
    console.log('=== Workout Plan Generator ===');
    console.log('Original prompt:', localPromptText);
    console.log('Selected muscles:', selectedMuscles);
    console.log('=================================');
    
    // Add enhanced prompt message
    setTimeout(() => {
      const muscleText = selectedMuscles.length > 0 
        ? ` focusing on ${selectedMuscles.join(', ')}` 
        : '';
      setChatMessages((prev) => [...prev, `AI: Creating a personalized workout plan${muscleText}...`]);
    }, 800);
    
    // Add generating plan message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Generating your personalized workout plan...']);
    }, 1300);
    
    // Generate the plan
    await generateWorkoutPlan(localPromptText, selectedMuscles);
    
    // Add plan ready message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Your workout plan is ready!']);
    }, 1800);
  };

  const handleOpenChat = () => setShowChat(true);
  const handleCloseChat = () => setShowChat(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleGetStartedClick = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const saved = await saveWorkoutPlan(localPromptText);
      if (saved?.id) {
        try {
          const userStr = localStorage.getItem('synapse_user');
          const user = userStr ? JSON.parse(userStr) : null;
          const url = new URL(`/api/plans/${saved.id}`, window.location.origin);
          if (user?.email) url.searchParams.set('email', user.email);
          await fetch(url.toString(), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'IN_PROGRESS', startDate: new Date().toISOString() }),
          });
        } catch (e) {
          console.error('Error updating plan status:', e);
        }
        router.push('/workout-tracker');
      }
    } catch (e) {
      console.error('Get started error:', e);
      setIsSaving(false);
    }
  };

  const handleMuscleUpdate = (muscles: string[]) => {
    setSelectedMuscles(muscles);
  };

  // Google Sign In handlers
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        initializeGoogleGSI();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeGoogleGSI();
      };

      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
        setIsSigningIn(false);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setIsSigningIn(false);
    }
  };

  const initializeGoogleGSI = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: "763002332533-9fk3gd611c2etmdfdmu3bhlu7u7uosaj.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt();
  };

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      const backendResponse = await fetch(`${SYNAPSE_BACKEND_URL}/api/synapse/auth/google/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: response.credential
        })
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        localStorage.setItem("synapse_token", data.token);
        localStorage.setItem("synapse_user", JSON.stringify({
          email: data.email,
          name: data.name,
          picture: data.picture
        }));

        // Save user to Synapse DB (non-blocking)
        fetch('/api/users/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            picture: data.picture
          })
        }).catch(error => {
          console.log('Note: Could not sync user to database, but you can still use the app');
        });

        setIsSignedIn(true);
      } else {
        console.error("Backend authentication failed:", data.error);
        alert("Sign in failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      alert("An error occurred during sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleTestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    try {
      localStorage.setItem("synapse_token", "test_token_" + Date.now());
      localStorage.setItem("synapse_user", JSON.stringify({
        email: testEmail,
        name: "Test User",
        picture: null
      }));

      // Save test user to Synapse DB (non-blocking)
      fetch('/api/users/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: "Test User",
          picture: null
        })
      }).catch(error => {
        console.log('Note: Could not sync user to database, but you can still use the app');
      });

      setIsSignedIn(true);
    } catch (error) {
      console.error("Test sign in error:", error);
    } finally {
      setTestLoading(false);
    }
  };

  // Base dimensions (original design) - same as planner
  const baseWidth = 402;
  const baseHeight = 874;

  // Dynamic dimensions based on state (same as planner but with muscle map)
  const row1Height = planGenerated ? 370 : 340;
  const chatMessagesHeight = showChat ? (isGenerating ? 220 : 160) : 0;
  const row2Height = planGenerated ? 140 : (showChat ? chatMessagesHeight + 144 : 180);
  const row3Height = planGenerated ? 72 : 52;
  const row4Height = planGenerated ? (showChat ? chatMessagesHeight + 144 : 180) : 0;
  const row6Height = 40;

  if (!mounted || isCheckingAuth) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <AnimatedLogo size={180} />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      {/* Responsive iPhone Frame (Planner Page Content) */}
      <div 
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        {/* Muscle Map Background inside iPhone Frame */}
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-auto">
          <MuscleMapDisplay
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
            onMuscleClick={handleMuscleClick}
            showToggle={false}
          />
        </div>

        {/* Main Container */}
        <div 
          className="w-full h-full flex flex-col relative z-10"
          style={{ backgroundColor: '#0b0b0b4D' }}
        >
          {/* Burger Menu Button */}
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>
          
          {/* Row 1: 400 X (370 or 302) - ORIGINAL HEIGHT */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out"
            style={{ height: `${(row1Height / 874) * 100}%` }}
          >
            <div style={{ display: isGenerating || planGenerated ? 'flex' : 'none' }} className="w-full h-full">
              <WorkoutGoalsSection 
                prompt={localPromptText}
                selectedMuscles={selectedMuscles}
                planData={planData}
                isLoading={isGenerating && planData.length === 0}
                onMuscleUpdate={handleMuscleUpdate}
              />
            </div>
          </div>

          {/* Row 3: GET STARTED button */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row3Height / 874) * 100}%` ,
            
            
            }}
            >
              <div className="w-full h-full flex items-center justify-center px-4">
                <div 
                  className={`flex items-center justify-center relative overflow-hidden transition-transform duration-200 ${isSaving ? 'cursor-wait' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                  onClick={handleGetStartedClick}
                  style={{
                    width: '60%',
                    height: `${(50 / 72) * 100}%`,
                    maxHeight: '50px',
                  }}
                >
                  <img
                    src="/vectors/button-frame.svg"
                    alt="Button Frame"
                    className="w-full h-full object-contain absolute inset-0"
                    style={{transform:'rotateY(180deg)'}}
                  />
                  {isSaving ? (
                    <div className="z-10" style={{ width: 'calc((100vh * 0.80) * (22 / 874))', height: 'calc((100vh * 0.80) * (22 / 874))' }}>
                      <Spinner size={22} />
                    </div>
                  ) : (
                    <span 
                      className="text-white font-bold z-10" 
                      style={{ 
                        fontFamily: 'var(--font-hanalei-fill)', 
                        fontSize: 'calc((100vh * 0.80) * (24 / 874))',
                        lineHeight: '1'
                      }}
                    >
                      GET STARTED
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Row 2: before generation */}
          {!planGenerated ? (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out"
              style={{ height: `${(row2Height / 874) * 100}%` }}
            >
              <PromptBoxOpenAI
                value={localPromptText}
                onChange={setLocalPromptText}
                onEnterPressed={handleGoClick}
                onClose={handleCloseChat}
                isLoading={isGenerating}
                thinkingMessages={chatMessages}
                showChat={showChat}
                chatHeight={chatMessagesHeight}
              />
            </div>
          ) : null}

          {/* Row 4: after generation - always shows input, chat messages when open */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row4Height / 874) * 100}%`,
            marginTop:'20%'
            }}
            >
              <PromptBoxOpenAI
                value={localPromptText}
                onChange={setLocalPromptText}
                onEnterPressed={handleGoClick}
                onClose={handleCloseChat}
                isLoading={isGenerating}
                thinkingMessages={chatMessages}
                placeholder="Ask about this workout or modify..."
                showChat={showChat}
                chatHeight={chatMessagesHeight}
              />
            </div>
          )}

          {/* Bottom spacer - always present */}
          <div 
            className="w-full border border-[#3B3B3B00] transition-all duration-500 ease-out"
            style={{ height: `${(row6Height / 874) * 100}%` }}
          />
        </div>
      </div>

      {/* Sign-In Overlay */}
      {!isSignedIn && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backdropFilter: 'blur(10px)', 
            backgroundColor: 'rgba(0,0,0,0.7)',
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="text-center p-8 pb-6 border-b border-white/10">
              <h1 className="text-3xl font-bold text-white mb-2">Workout Planner</h1>
              <p className="text-lg text-white/60">
                Sign in to create your personalized workout plan
              </p>
            </div>
            
            {/* Content */}
            <div className="p-8 space-y-6">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                variant="outline"
                className="w-full bg-white text-white hover:bg-gray-200 border-0 h-14 text-base font-semibold"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="mr-3">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.72 1 10.3 1 12c0 1.7.43 3.28 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isSigningIn ? "Signing in..." : "Sign in with Google"}
              </Button>

              <Button
                disabled
                variant="outline"
                className="w-full bg-[#FC4C02]/10 text-[#FC4C02] border border-[#FC4C02]/20 opacity-60 cursor-not-allowed h-14 text-base font-semibold relative overflow-hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="mr-3 flex-shrink-0" fill="#FC4C02">
                  <path d="M7.09 21.88c-.27.01-.56.04-.86.04-2.08 0-3.77-1.34-3.77-3.73 0-2.6 1.8-5.42 4.88-5.42.88 0 1.73.27 2.36.74l.05.03-.97 1.47-.04-.02c-.33-.24-.78-.4-1.25-.4-1.61 0-2.78 1.53-2.78 3.4 0 1.28.74 2.1 1.82 2.1.24 0 .48-.04.66-.09v-1.7h-1.2v-1.57h3.08v3.86c-.55.72-1.59 1.24-2.98 1.29zM14.1 18.3c0 2.21 1.37 3.62 3.63 3.62.73 0 1.42-.15 1.99-.42v-3.77h-2.4v-1.57h4.2v5.84c-.85.5-2.12.83-3.69.83-3.33 0-5.73-2.22-5.73-5.53 0-3.3 2.37-5.57 5.6-5.57 2.04 0 3.43.84 4.2 1.94l-1.47 1.07c-.51-.75-1.4-1.29-2.73-1.29-1.97 0-3.6 1.53-3.6 3.68z"/>
                </svg>
                <span>Sign in with Strava</span>
                <span className="ml-auto text-xs text-[#FC4C02]/60 font-normal bg-[#FC4C02]/10 px-2 py-0.5 rounded-full whitespace-nowrap">Coming Soon</span>
              </Button>

              {process.env.NODE_ENV !== 'production' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-black px-2 text-white/50">Or</span>
                    </div>
                  </div>

                  <form onSubmit={handleTestSignIn} className="space-y-4">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter test email"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20 h-12"
                    />
                    <Button
                      type="submit"
                      disabled={testLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-base font-semibold"
                    >
                      {testLoading ? "Signing in..." : "Test Sign In"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Internal links for SEO */}
      <nav className="flex justify-center gap-6 pb-20 pt-2" style={{ opacity: 0.4 }}>
        <a href="/" className="text-white text-sm">Home</a>
        <a href="/planner" className="text-white text-sm">AI Workout Planner</a>
        <a href="/blog" className="text-white text-sm">Fitness Blog</a>
        <a href="/training-chat" className="text-white text-sm">Training Chat</a>
      </nav>

      {/* Floating Navigation Bar - hidden when AI chat is open */}
      {!showChat && <FloatingNavBar onAIClick={handleOpenChat} />}
    </div>
  );
}