'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import GoalsSection from '@/components/GoalsSection';
import ViewPlanButton from '@/components/ViewPlanButton';
import ChatRow from '@/components/ChatRow';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import AnimatedLogo from '@/components/AnimatedLogo';
import SynapseFitLogo from '@/components/SynapseFitLogo';
import useMakePlan from '@/lib/hooks/useMakePlan';
import usePromptEnhancer from '@/lib/hooks/usePromptEnhancer';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setPromptText, setEnhancedPromptText, addPromptToHistory } from '@/lib/redux/slices/planSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function PlannerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { promptText, planGenerated, isGenerating } = useAppSelector((state) => state.plan);
  const [localPromptText, setLocalPromptText] = useState('');
  const [localEnhancedPromptText, setLocalEnhancedPromptText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);

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

  const { enhancePrompt } = usePromptEnhancer();
  const { generatePlan } = useMakePlan(localEnhancedPromptText);

  // Initial load
  useEffect(() => {
    dispatch(setPromptText(localPromptText));
  }, [dispatch, localPromptText]);

  const handleGoClick = async () => {
    setShowChat(true);
    // Reset chat messages
    setChatMessages([]);
    
    // Add user message
    setChatMessages((prev) => [...prev, `User: ${localPromptText}`]);
    
    // Add thinking message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Analyzing your goals...']);
    }, 300);
    
    console.log('=== Prompt Enhancer ===');
    console.log('Original prompt:', localPromptText);
    
    let enhanced = localPromptText; // Default to original
    try {
      enhanced = await enhancePrompt(localPromptText);
    } catch (err) {
      console.error('Prompt enhancer failed:', err);
    }
    
    console.log('Enhanced prompt:', enhanced);
    console.log('=======================');
    
    // Add enhanced prompt message
    setTimeout(() => {
      if (enhanced !== localPromptText) {
        setChatMessages((prev) => [...prev, `AI: I understand you want: "${enhanced}"`]);
      } else {
        setChatMessages((prev) => [...prev, `AI: Using your original request: "${enhanced}"`]);
      }
    }, 800);
    
    // Add generating plan message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Generating personalized plan...']);
    }, 1300);
    
    setLocalEnhancedPromptText(enhanced);
    dispatch(setPromptText(localPromptText));
    dispatch(setEnhancedPromptText(enhanced));
    dispatch(addPromptToHistory(localPromptText));
    // Pass the actual current prompt to generatePlan
    await generatePlan(localPromptText);
    
    // Add plan ready message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Your plan is ready!']);
    }, 1800);
  };

  const handleViewPlanClick = () => {
    const planId = localStorage.getItem('current_plan_id');
    if (planId) {
      router.push(`/plan-detail/${planId}`);
    } else {
      router.push('/my-plans');
    }
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
          // Silent fail - user is already stored in localStorage
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
        // Silent fail - user is already stored in localStorage
        console.log('Note: Could not sync user to database, but you can still use the app');
      });

      setIsSignedIn(true);
    } catch (error) {
      console.error("Test sign in error:", error);
    } finally {
      setTestLoading(false);
    }
  };

  // Base dimensions (original design)
  const baseWidth = 402;
  const baseHeight = 874;

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
        className="bg-black/20 rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        {/* Background logo animation within frame */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0 scale-150 -translate-y-[20%]">
          <SynapseFitLogo size={180} loading={true} accentInk="#FFFFFF" />
        </div>

        {/* Main Container */}
        <div 
          className="w-full h-full flex flex-col relative z-10"
          style={{ backgroundColor: '#15151580' }}
        >
          {/* Burger Menu Button */}
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>

          {planGenerated ? (
            // === POST-GENERATION ===
            <div className="flex-1 flex flex-col overflow-hidden pt-12 sm:pt-14 pb-3">
              <div className="flex-[1.5] min-h-0 flex items-start justify-center overflow-hidden mb-[50px]">
                <GoalsSection isLoading={false} />
              </div>
              {showChat && (
                <div className="flex-[1] min-h-0 overflow-hidden">
                  <ChatRow 
                    targetHeight="100%" 
                    chatMessages={chatMessages} 
                  />
                </div>
              )}
              <div className="flex-[1] min-h-0 flex items-center justify-center overflow-hidden">
                <ViewPlanButton isLoading={false} onClick={handleViewPlanClick} />
              </div>
            </div>
          ) : isGenerating || showChat ? (
            // === DURING GENERATION ===
            <div className="flex-1 flex flex-col overflow-hidden pt-12 sm:pt-14 pb-3">
              <div className="flex-[1.2] min-h-0 overflow-hidden">
                <GoalsSection isLoading={false} />
              </div>
              {showChat && (
                <div className="flex-[1] min-h-0 overflow-hidden">
                  <ChatRow 
                    targetHeight="100%" 
                    chatMessages={chatMessages} 
                  />
                </div>
              )}
            </div>
          ) : (
            // === BEFORE GENERATION ===
            <div className="flex-1 flex items-center justify-center px-4">
              <PromptBoxOpenAI
                value={localPromptText}
                onChange={setLocalPromptText}
                onEnterPressed={handleGoClick}
                isLoading={false}
                placeholder="e.g. Lose 5kg in 30 days, Build muscle..."
                bgColor="#1e1e1e70"
              />
            </div>
          )}
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
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Synapse</h1>
              <p className="text-lg text-white/60">
                Sign in to create your personalized fitness plan
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
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}