'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatRowProps {
  targetHeight: string;
  chatMessages: string[];
}

const ChatRow: React.FC<ChatRowProps> = ({ targetHeight, chatMessages }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState<string>("0%");

  useEffect(() => {
    // Animate height to target when component mounts
    requestAnimationFrame(() => {
      setCurrentHeight(targetHeight);
    });
  }, [targetHeight]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div 
      className="w-full border border-[#3B3B3B00] flex flex-col items-center overflow-hidden"
      style={{ 
        height: currentHeight,
        transition: "height 500ms ease-out"
      }}
    >
      <div className="w-full h-full flex flex-col p-2 sm:p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <img 
              src="/vectors/ai-icon.svg" 
              alt="AI Icon" 
              className="w-full h-full"
            />
          </div>
          <h3 className="text-white font-semibold text-xs sm:text-sm">AI Thought Process</h3>
        </div>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-1">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`p-1 rounded text-xs sm:text-sm transition-all duration-300 ease-out ${
                msg.startsWith('User:') 
                  ? 'bg-blue-600/20 text-blue-200 ml-3' 
                  : 'bg-gray-700/30 text-gray-200 mr-3'
              }`}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRow;
