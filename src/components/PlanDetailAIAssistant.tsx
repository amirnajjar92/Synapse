'use client';

import React, { useState } from 'react';
import PromptBoxOpenAI from './PromptBoxOpenAI';

interface PlanDetailAIAssistantProps {
  planContext?: string;
  onModify?: (prompt: string) => void;
}

const PlanDetailAIAssistant: React.FC<PlanDetailAIAssistantProps> = ({
  planContext,
  onModify,
}) => {
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => setShowChat(true);

  const handleClose = () => setShowChat(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setShowChat(true);

    const userMsg = `User: ${input}`;
    setChatMessages(prev => [...prev, userMsg]);
    setChatMessages(prev => [...prev, 'AI: Thinking...']);

    const currentInput = input;
    setInput('');

    try {
      const contextText = planContext || 'User is viewing their fitness plan on the plan detail page.';
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `You are a helpful fitness plan assistant. The user's plan context:\n${contextText}\n\nThe user wants to modify their plan: ${currentInput}\n\nRespond with a clear, actionable description of the changes the user wants. Keep it concise.`,
        }),
      });

      const data = await res.json();
      const reply = data?.answer || 'Sorry, I could not process that.';

      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== 'AI: Thinking...');
        return [...filtered, `AI: ${reply}`];
      });

      if (onModify) onModify(currentInput);
    } catch {
      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== 'AI: Thinking...');
        return [...filtered, 'AI: Sorry, something went wrong. Please try again.'];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={showChat ? handleClose : handleOpen}
        className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 hover:bg-zinc-900 transition-colors flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-2 3h-4s-2-1-2-3a4 4 0 0 1 4-4z" />
            <path d="M8 13h8" />
            <path d="M6 17h12" />
            <path d="M10 9h4" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-white">AI Assistant</div>
          <div className="text-[11px] text-zinc-500">Modify your plan with AI</div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#71717a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${showChat ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Message area + PromptBoxOpenAI */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ease-out ${showChat ? 'opacity-100' : 'opacity-0 overflow-hidden flex-[0_0_0]'}`}>
        <PromptBoxOpenAI
          value={input}
          onChange={setInput}
          onEnterPressed={handleSend}
          onClose={handleClose}
          placeholder="Describe changes to your plan..."
          isLoading={isLoading}
          thinkingMessages={chatMessages}
          showChat={showChat}
          chatHeight={120}
          bgColor="#18181b"
        />
      </div>

      {/* Collapsed preview */}
      {!showChat && (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-[12px] text-zinc-600 text-center leading-relaxed">
            Tap to ask AI to modify exercises, adjust durations, or change anything in your plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanDetailAIAssistant;
