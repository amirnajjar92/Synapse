'use client';

import React, { useRef, useEffect } from 'react';

interface PromptBoxOpenAIProps {
  value: string;
  onChange: (text: string) => void;
  onEnterPressed?: () => void;
  onClose?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  thinkingMessages?: string[];
  hideThinkingBox?: boolean;
  showChat?: boolean;
  chatHeight?: number;
  bgColor?: string;
}

const PromptBoxOpenAI: React.FC<PromptBoxOpenAIProps> = ({ 
  value, 
  onChange, 
  onEnterPressed,
  onClose,
  placeholder = "e.g. Lose 5kg in 30 days, Build muscle...",
  isLoading = false,
  disabled = false,
  thinkingMessages = [],
  hideThinkingBox = false,
  showChat = false,
  chatHeight = 200,
  bgColor = '#1e1e1e',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [value]);

  // Auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [thinkingMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPressed?.();
    }
  };

  const cleanMessage = (msg: string) => {
    return msg.replace(/^(AI:|User:)\s*/, '');
  };

  const renderMessage = (msg: string, index: number) => {
    const text = cleanMessage(msg);

    return (
      <div key={index} className="text-[13px] opacity-60 text-gray-300 py-0.5 px-1.5">
        {text}
      </div>
    );
  };

  return (
    <div className={`w-full flex flex-col items-center gap-0 h-full ${showChat ? 'justify-end' : 'justify-center'}`}>
      {/* Chat Messages Area - shown when showChat is true */}
      {showChat && (
        <div 
          className="w-full overflow-hidden flex-shrink-0"
          style={{
            width: `${(399 / 402) * 100}%`,
            maxWidth: '399px',
            height: `${chatHeight}px`,
          }}
        >
          <div 
            className="w-full h-full rounded-2xl p-3 flex flex-col"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 100%)',
              backdropFilter: 'blur(100px)',
              WebkitBackdropFilter: 'blur(100px)',
            }}
          >
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              <img src="/vectors/ai-icon.svg" alt="AI" className="w-4 h-4" />
              <span className="text-white font-semibold" style={{ fontSize: '14px', lineHeight: '1.2' }}>AI Thought Process</span>
              {isLoading && (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="ml-auto p-1 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Close chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div ref={messageContainerRef} className="flex-1 overflow-y-auto space-y-1">
              {thinkingMessages.length > 0 ? (
                thinkingMessages.map((msg, i) => renderMessage(msg, i))
              ) : (
                <div className="text-[13px] opacity-60 text-gray-500 italic px-1.5">Analyzing your request...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thinking Box - legacy fallback when showChat is false and loading */}
      {!showChat && isLoading && !hideThinkingBox && (
        <div 
          className="relative overflow-hidden transition-all duration-500 ease-out flex-shrink-0"
          style={{
            width: `${(399 / 402) * 100}%`,
            maxWidth: '399px',
            height: '96px',
          }}
        >
          <div 
            className="w-full h-full rounded-2xl p-3 flex flex-col"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 100%)',
              // backdropFilter: 'blur(100px)',
              WebkitBackdropFilter: 'blur(100px)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <img src="/vectors/ai-icon.svg" alt="AI" className="w-4 h-4" />
              <span className="text-white font-semibold" style={{ fontSize: '14px', lineHeight: '1.2' }}>AI Thought Process</span>
              <div className="flex items-center gap-0.5 ml-auto">
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
            <div ref={messageContainerRef} className="flex-1 overflow-y-auto space-y-0.5">
              {thinkingMessages.length > 0 ? (
                thinkingMessages.map((msg, i) => (
                  <div key={i} className="text-[13px] opacity-60 text-gray-300 py-0.5 px-1.5">
                    {cleanMessage(msg)}
                  </div>
                ))
              ) : (
                <div className="text-[13px] opacity-60 text-gray-500 italic px-1.5">Analyzing your request...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Input Box */}
      <div 
        className="relative overflow-hidden flex-shrink-0 "
        style={{
          width: `${(376 / 402) * 100}%`,
          maxWidth: '376px',
          height: '134px',
         
        }}
      >
        <div className="w-full h-full rounded-2xl px-4 py-4 flex flex-col" style={{ backgroundColor: bgColor, border: '1px solid #333' }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={2}
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-500 leading-relaxed disabled:opacity-50 w-full"
            style={{ maxHeight: '70px' }}
          />
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-gray-600">Enter to send</span>
            <button
              onClick={onEnterPressed}
              disabled={!value.trim() || disabled || isLoading}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
              style={{
                backgroundColor: value.trim() ? '#ffffff' : 'transparent',
              }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke={value.trim() ? '#000000' : '#6b7280'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBoxOpenAI;
