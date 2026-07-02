'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import GoalsSection from '@/components/GoalsSection';
import ViewPlanButton from '@/components/ViewPlanButton';
import ChatRow from '@/components/ChatRow';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import SynapseFitLogo from '@/components/SynapseFitLogo';

export default function PlannerDemo() {
  const router = useRouter();
  const [localPromptText, setLocalPromptText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}
