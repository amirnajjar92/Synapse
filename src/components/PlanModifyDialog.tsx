'use client';

import React, { useState } from 'react';
import PromptBoxOpenAI from './PromptBoxOpenAI';

interface PlanModifyDialogProps {
  open: boolean;
  onClose: () => void;
  planContext?: string;
  onApply?: (modificationPrompt: string, aiResponse: string) => Promise<void>;
}

const PlanModifyDialog: React.FC<PlanModifyDialogProps> = ({
  open,
  onClose,
  planContext,
  onApply,
}) => {
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = `User: ${input}`;
    setChatMessages(prev => [...prev, userMsg]);
    setChatMessages(prev => [...prev, 'AI: Thinking...']);
    const currentInput = input;
    setInput('');

    try {
      const contextText = planContext || '';
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `You are a helpful fitness plan assistant. The user's plan context:\n${contextText}\n\nThe user wants to modify their plan: ${currentInput}\n\nRespond with a clear, detailed description of all the changes to apply. Be specific about what should change.`,
        }),
      });
      const data = await res.json();
      const reply = data?.answer || 'Sorry, I could not process that.';
      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== 'AI: Thinking...');
        return [...filtered, `AI: ${reply}`];
      });
      setPendingResponse(reply);
      setPendingInput(currentInput);
    } catch {
      setChatMessages(prev => {
        const filtered = prev.filter(m => m !== 'AI: Thinking...');
        return [...filtered, 'AI: Sorry, something went wrong. Please try again.'];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!pendingResponse || !pendingInput || !onApply) return;
    setApplying(true);
    try {
      await onApply(pendingInput, pendingResponse);
      setChatMessages(prev => [...prev, 'AI: Changes applied successfully!']);
    } catch {
      setChatMessages(prev => [...prev, 'AI: Failed to apply changes. Please try again.']);
    } finally {
      setPendingResponse(null);
      setPendingInput(null);
      setApplying(false);
    }
  };

  const handleDecline = () => {
    setPendingResponse(null);
    setPendingInput(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Modify Plan</div>
            <div className="text-[11px] text-zinc-500">Describe the changes you want</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <PromptBoxOpenAI
            value={input}
            onChange={setInput}
            onEnterPressed={handleSend}
            placeholder="e.g. Add more cardio, reduce rest days..."
            isLoading={isLoading || applying}
            thinkingMessages={chatMessages}
            showChat={chatMessages.length > 0}
            chatHeight={160}
            bgColor="#18181b"
          />

          {/* Confirmation bar */}
          {pendingResponse && !applying && (
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-zinc-800">
              <span className="text-[12px] text-zinc-400">Apply these changes?</span>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 rounded-full bg-white text-black text-[11px] font-semibold hover:opacity-90 transition-opacity"
              >
                Yes
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] hover:bg-zinc-700 transition-colors"
              >
                No
              </button>
            </div>
          )}

          {applying && (
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-zinc-800">
              <div className="w-3 h-3 rounded-full border border-white/20 animate-spin" style={{ borderTopColor: 'white', borderWidth: '1.5px' }} />
              <span className="text-[12px] text-zinc-400">Applying changes...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanModifyDialog;
