'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import ViewPlanButton from '@/components/ViewPlanButton';
import ChatRow from '@/components/ChatRow';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import SynapseFitLogo from '@/components/SynapseFitLogo';

// Demo-specific Goals Section Component
const DemoGoalsSection = ({ 
  promptText, 
  isGenerating, 
  planGenerated 
}: { 
  promptText: string;
  isGenerating: boolean;
  planGenerated: boolean;
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);
  const prevGenerating = useRef(isGenerating);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (planGenerated && !hasAnimated.current) {
      setRevealedCount(6);
      setAllRevealed(true);
      hasAnimated.current = true;
      return;
    }

    if (isGenerating && !prevGenerating.current) {
      setRevealedCount(0);
      setAllRevealed(false);
      hasAnimated.current = false;
    }

    if (!isGenerating && prevGenerating.current && !hasAnimated.current) {
      hasAnimated.current = true;
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= 6) {
          clearInterval(interval);
          setAllRevealed(true);
        }
      }, 400);
      return () => clearInterval(interval);
    }

    prevGenerating.current = isGenerating;
  }, [isGenerating, planGenerated]);

  const planItems = [
    'Daily Meal Plan',
    'Running / Cardio Plan',
    'Nutrients',
    'Suppliments',
    'Recomended',
    'Challenges',
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tickReveal {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
      <div className="w-full flex flex-col pt-3 sm:pt-4 md:pt-6 pb-0 pl-14 sm:pl-16 md:pl-18 pr-14 sm:pr-16 md:pr-18 transition-all duration-300 ease-out">
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 border-b border-gray-600 pb-3 sm:pb-4 md:pb-6">
          <h2 
            className="text-white font-bold text-2xl sm:text-3xl md:text-4xl" 
            style={{ 
              fontFamily: 'var(--font-hanalei-fill)', 
              lineHeight: '1'
            }}
          >
            GOALS
          </h2>
          <div className="border-l border-gray-500 pl-3 sm:pl-4 md:pl-6">
            <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light">
              {promptText || 'Your fitness goal here'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {planItems.map((item, index) => {
            const isRevealed = revealedCount > index;
            const stillLoading = isGenerating && !isRevealed;

            return (
              <div 
                key={index} 
                className="grid grid-cols-4 gap-0 items-center border-b border-gray-600 py-1.5 sm:py-2 md:py-3 transition-all duration-300 hover:bg-gray-800/30"
              >
                <span className="text-gray-300 text-xs sm:text-sm md:text-base font-light col-span-3 pl-1 sm:pl-2 md:pl-3">
                  {item}
                </span>
                <div className="col-span-1 flex items-center justify-center">
                  {stillLoading && (
                    <div className="animate-spin rounded-full border-2 border-t-transparent border-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  )}
                  {isRevealed && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className="sm:w-6 sm:h-6 md:w-8 md:h-8"
                      style={{ animation: 'tickReveal 0.3s ease-out' }}
                    >
                      <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}

          {allRevealed && (
            <div 
              className="grid grid-cols-4 gap-0 items-center border-t-2 border-gray-500 py-2 sm:py-2.5 md:py-3"
              style={{ animation: 'tickReveal 0.4s ease-out' }}
            >
              <span className="text-white text-xs sm:text-sm md:text-base font-semibold col-span-3 pl-1 sm:pl-2 md:pl-3">
                Plan Completed
              </span>
              <div className="col-span-1 flex items-center justify-center">
                <svg 
                  width="22" 
                  height="22" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="sm:w-7 sm:h-7 md:w-9 md:h-9"
                >
                  <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2" fill="none" />
                  <path d="M8 12L11 15L16 9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default function PlannerDemo() {
  const router = useRouter();
  const [localPromptText, setLocalPromptText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const DEMO_PROMPT = "Build muscle and strength with a 4-day upper/lower split";

  useEffect(() => {
    setMounted(true);
    
    // Typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < DEMO_PROMPT.length) {
        setLocalPromptText(DEMO_PROMPT.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        // Auto-submit after typing completes
        setTimeout(() => {
          handleGoClick();
        }, 800);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const handleGoClick = async () => {
    setShowChat(true);
    setIsGenerating(true);
    setChatMessages([]);
    
    // Add user message
    setChatMessages((prev) => [...prev, `User: ${localPromptText}`]);
    
    // Add thinking message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Analyzing your goals...']);
    }, 300);
    
    // Add enhanced prompt message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, `AI: I understand you want to build muscle and strength with a structured program.`]);
    }, 800);
    
    // Add generating plan message
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Generating personalized plan...']);
    }, 1300);
    
    // Complete generation
    setTimeout(() => {
      setChatMessages((prev) => [...prev, 'AI: Your plan is ready!']);
      setIsGenerating(false);
      setPlanGenerated(true);
    }, 2500);
  };

  const handleViewPlanClick = () => {
    // Demo mode: do nothing or show message
  };

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
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
                <DemoGoalsSection promptText={localPromptText} isGenerating={false} planGenerated={true} />
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
                <DemoGoalsSection promptText={localPromptText} isGenerating={isGenerating} planGenerated={false} />
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
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}
