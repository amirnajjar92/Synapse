'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptBox from '@/components/PromptBox';
import CustomButton from '@/components/CustomButton';
import GoalsSection from '@/components/GoalsSection';
import ViewPlanButton from '@/components/ViewPlanButton';
import ChatRow from '@/components/ChatRow';
import useMakePlan from '@/lib/hooks/useMakePlan';
import usePromptEnhancer from '@/lib/hooks/usePromptEnhancer';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setPromptText, setEnhancedPromptText, resetPlan, addPromptToHistory } from '@/lib/redux/slices/planSlice';

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
  const [localPromptText, setLocalPromptText] = useState('I want to lose 10kg in 30 days and I am 85kg now');
  const [localEnhancedPromptText, setLocalEnhancedPromptText] = useState('I want to lose 10kg in 30 days and I am 85kg now');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);

  // Authentication states
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testLoading, setTestLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Check if user is signed in on mount
  useEffect(() => {
    const token = localStorage.getItem('synapse_token');
    const userStr = localStorage.getItem('synapse_user');
    if (token && userStr) {
      setIsSignedIn(true);
      setUserData(JSON.parse(userStr));
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
    router.push('/plan-detail');
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
        const userInfo = {
          email: data.email,
          name: data.name,
          picture: data.picture
        };
        localStorage.setItem("synapse_token", data.token);
        localStorage.setItem("synapse_user", JSON.stringify(userInfo));

        const synapseUserResponse = await fetch('/api/users/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userInfo)
        });

        if (!synapseUserResponse.ok) {
          console.error('Failed to save user to Synapse DB');
        }

        setUserData(userInfo);
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
      const userInfo = {
        email: testEmail,
        name: "Test User",
        picture: null
      };
      localStorage.setItem("synapse_token", "test_token_" + Date.now());
      localStorage.setItem("synapse_user", JSON.stringify(userInfo));

      const synapseUserResponse = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
      });

      if (!synapseUserResponse.ok) {
        console.error('Failed to save test user to Synapse DB');
      }

      setUserData(userInfo);
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

  // Dynamic dimensions based on state (original heights)
  const row1Height = planGenerated ? 370 : 302;
  const row2Height = planGenerated ? 140 : 206;
  const row3Height = planGenerated ? 106 : 52;
  const row4Height = planGenerated ? 206 : 0;
  const row5Height = planGenerated ? 52 : 0;
  const row6Height = planGenerated ? 30 : 0;
  const chatRowHeight = showChat ? (planGenerated ? row2Height : 100) : 0; // Chat row height

  if (isCheckingAuth) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      {/* Profile Circle - Bottom Left */}
      {isSignedIn && (
        <div className="absolute bottom-4 left-4 z-40">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
            {userData?.picture ? (
              <img 
                src={userData.picture} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {userData?.name?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Responsive iPhone Frame (Planner Page Content) */}
      <div 
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        {/* Main Container */}
        <div 
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Row 1: 400 X (370 or 302) - ORIGINAL HEIGHT */}
          <div 
            className="w-full border border-[#3B3B3B00] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out"
            style={{ height: `${(row1Height / 874) * 100}%` }}
          >
            {isGenerating || planGenerated ? (
              <GoalsSection isLoading={false} />
            ) : null}
          </div>

          {/* Row 3: 400 X (106 or 52) - VIEW PLAN BUTTON (Moved up) */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row3Height / 874) * 100}%` }}
            >
              <ViewPlanButton isLoading={false} onClick={handleViewPlanClick} />
            </div>
          )}

          {/* Chat Row (after first GO click, always shown) */}
          {showChat && (
            <ChatRow 
              targetHeight={`${(chatRowHeight / 874) * 100}%`} 
              chatMessages={chatMessages} 
            />
          )}

          {/* Row 2: 400 X (114 or 206) */}
          {!planGenerated && !isGenerating ? (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out"
              style={{ height: `${(row2Height / 874) * 100}%` }}
            >
              <PromptBox
                value={localPromptText}
                onChange={setLocalPromptText}
                isLoading={false}
                usePlannerStyle={true}
              />
            </div>
          ) : (
            planGenerated ? (
              // Show nothing here because ChatRow is already shown
              null
            ) : null
          )}

          {/* Row 4: 400 X 206 - only when plan is generated (PromptBox moved here) */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] flex items-center justify-center relative transition-all duration-500 ease-out overflow-hidden"
              style={{ height: `${(row4Height / 874) * 100}%` }}
            >
              <PromptBox
                value={localPromptText}
                onChange={setLocalPromptText}
                isLoading={false}
                usePlannerStyle={true}
              />
            </div>
          )}

          {/* Row 5: 176 X 52 + 226 X 52 */}
          {!isGenerating && (
            <div 
              className="flex w-full border border-[#3B3B3B00] transition-all duration-300"
              style={{ height: `${(52 / 874) * 100}%` }}
            >
              <div 
                className="h-full border border-[#3B3B3B00] flex items-center justify-center"
                style={{ width: `${(176 / 400) * 100}%` }}
              />
              <div 
                className="h-full border border-[#3B3B3B00] flex items-center justify-center p-1 sm:p-2 relative"
                style={{ width: `${(226 / 400) * 100}%` }}
              >
                <CustomButton
                  text="GO"
                  isLoading={false}
                  onClick={handleGoClick}
                />
              </div>
            </div>
          )}
          {/* Empty div to preserve layout while generating */}
          {isGenerating && (
            <div 
              className="flex w-full border border-[#3B3B3B00]"
              style={{ height: `${(52 / 874) * 100}%` }}
            />
          )}

          {/* Row 6: 400 X 30 - only when plan is generated */}
          {planGenerated && (
            <div 
              className="w-full border border-[#3B3B3B00] transition-all duration-500 ease-out"
              style={{ height: `${(row6Height / 874) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Sign-In Overlay */}
      {!isSignedIn && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(10px)', 
            backgroundColor: 'rgba(0,0,0,0.7)',
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <div className="flex flex-col items-center gap-6 p-8 bg-[#1a1a1a] rounded-3xl shadow-2xl max-w-md w-11/12">
            <h1 className="text-3xl font-bold text-white text-center">Welcome to Synapse</h1>
            <p className="text-lg text-gray-400 text-center">Sign in to create your personalized fitness plan</p>
            
            <button 
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.72 1 10.3 1 12c0 1.7.43 3.28 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isSigningIn ? "Signing in..." : "Sign in with Google"}
            </button>

            {process.env.NODE_ENV !== 'production' && (
              <>
                <div className="text-white/50 my-2">or</div>

                <form onSubmit={handleTestSignIn} className="flex flex-col gap-3 w-full">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter test email"
                    className="px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-gray-500 w-full"
                  />
                  <button
                    type="submit"
                    disabled={testLoading}
                    className="flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testLoading ? "Signing in..." : "Test Sign In"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}