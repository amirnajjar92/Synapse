'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatRowProps {
  targetHeight: string;
  chatMessages: string[];
  textColor?: string;
  isDarkMode?: boolean;
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
          {chatMessages.map((msg, index) => {
            const isUser = msg.startsWith('User:');
            const isExtracted = msg.startsWith('📊');
            const isChanges = msg.startsWith('✏️');
            const isSaved = msg.startsWith('📋');
            const isSuccess = msg.startsWith('✅');
            const isError = msg.startsWith('❌');
            const isBullet = msg.startsWith('  •');

            let className = 'p-1.5 rounded text-xs sm:text-sm transition-all duration-300 ease-out mr-3 ';

            if (isUser) {
              className += 'bg-blue-600/20 text-blue-200 ml-3';
            } else if (isExtracted || isChanges || isSaved) {
              className += 'bg-[#3B63CF]/15 text-white font-medium';
            } else if (isSuccess) {
              className += 'bg-green-600/20 text-green-200';
            } else if (isError) {
              className += 'bg-red-600/20 text-red-200';
            } else if (isBullet) {
              className += 'bg-gray-800/40 text-gray-100 ml-4';
            } else {
              className += 'bg-gray-700/30 text-gray-200';
            }

            return (
              <div key={index} className={className}>
                {msg}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatRow;
