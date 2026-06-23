'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ChatRow from './ChatRow';
import { getTheme, loadTheme } from '@/lib/theme';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface AIAssistantSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIAssistantSheet({ isOpen, onClose }: AIAssistantSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = getTheme(currentTheme);

  // Save message to database
  const saveMessageToDb = async (
    role: 'user' | 'assistant',
    content: string,
    intent?: string,
    confidence?: string,
    metadata?: any
  ) => {
    try {
      const userStr = localStorage.getItem('synapse_user');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          conversationId,
          role,
          content,
          intent,
          confidence,
          contextPage: pathname,
          metadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!conversationId && data.conversationId) {
          setConversationId(data.conversationId);
        }
      }
    } catch (error) {
      console.error('Failed to save message to DB:', error);
    }
  };

  // Load conversation history
  const loadConversationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const userStr = localStorage.getItem('synapse_user');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await fetch(
        `/api/ai/conversations?email=${encodeURIComponent(user.email)}&limit=1`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.conversations && data.conversations.length > 0) {
          const lastConversation = data.conversations[0];
          setConversationId(lastConversation.id);

          const loadedMessages: Message[] = lastConversation.messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
          }));

          if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load history when sheet opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadConversationHistory();
    }
  }, [isOpen]);

  // Listen for theme changes
  useEffect(() => {
    setCurrentTheme(loadTheme());
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMessages]);

  // Get context-aware suggestions
  const getContextSuggestions = () => {
    if (pathname?.includes('/planner')) {
      return [
        { icon: '🎯', text: 'Create a fitness plan', example: 'Create a 30-day plan to lose 5kg' },
        { icon: '✏️', text: 'Modify my plan', example: 'Add more cardio to my current plan' },
        { icon: '💪', text: 'Set new goals', example: 'Help me build muscle mass' },
      ];
    } else if (pathname?.includes('/monitor')) {
      return [
        { icon: '📊', text: 'Log today\'s activity', example: 'Ran 10km in 50 minutes, weight 72kg' },
        { icon: '📈', text: 'Analyze my progress', example: 'How am I doing this week?' },
        { icon: '🔍', text: 'Track metrics', example: 'Show my distance trends' },
      ];
    }
    return [
      { icon: '🎯', text: 'Create a fitness plan', example: 'Create a 30-day plan to lose 5kg' },
      { icon: '📊', text: 'Log an activity', example: 'Ran 10km in 50 minutes' },
      { icon: '💡', text: 'Ask me anything', example: 'What should I eat after workout?' },
    ];
  };

  const suggestions = getContextSuggestions();

  const handleSuggestionClick = (example: string) => {
    setUserInput(example);
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setChatMessages([]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessageToDb('user', userMessage.content);

    setChatMessages([`You: ${userInput.trim()}`]);
    setUserInput('');
    setIsProcessing(true);

    try {
      const userStr = localStorage.getItem('synapse_user');
      if (!userStr) throw new Error('User not authenticated');
      const user = JSON.parse(userStr);

      setChatMessages(prev => [...prev, '🤖 Analyzing your request...']);

      const response = await fetch('/api/ai/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          message: userMessage.content,
          context: {
            page: pathname,
            conversationHistory: messages.slice(-5),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to process request');

      const data = await response.json();
      setChatMessages([]);

      if (data.intent) {
        setChatMessages(prev => [...prev, `🎯 Detected: ${data.intent.replace(/_/g, ' ')}`]);
      }

      if (data.processing) {
        setChatMessages(prev => [...prev, `⚙️ ${data.processing}`]);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Task completed successfully!',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setChatMessages(prev => [...prev, `✅ ${data.response || 'Done!'}`]);

      await saveMessageToDb(
        'assistant',
        assistantMessage.content,
        data.intent,
        data.confidence,
        {
          metrics: data.metrics,
          navigationLinks: data.navigationLinks,
          action: data.action,
          redirectTo: data.redirectTo,
        }
      );

      if (data.redirectTo) {
        setChatMessages(prev => [...prev, `📍 Redirecting to ${data.redirectTo}...`]);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToDb('assistant', errorMessage.content);
      setChatMessages(['❌ Error occurred. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigationClick = (path: string) => {
    router.push(path);
    onClose();
  };

  const renderMessageContent = (content: string) => {
    let processedContent = content;
    const links: Array<{ text: string; path: string }> = [];

    const markdownMatches = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    markdownMatches.forEach(match => {
      const [fullMatch, text, path] = match;
      if (path.startsWith('/')) {
        links.push({ text, path });
        processedContent = processedContent.replace(fullMatch, text);
      }
    });

    return (
      <div className="space-y-2">
        <p className="text-sm whitespace-pre-wrap">{processedContent}</p>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigationClick(link.path)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff',
                }}
              >
                {link.text} →
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-screen bg-black border-white/10 p-0 flex flex-col !max-w-none"
        style={{ width: '100vw', maxWidth: '100vw' }}
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold text-white">
                AI Assistant
              </SheetTitle>
              <SheetDescription className="text-xs text-white/60">
                Your fitness companion
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium mb-3 text-white">💡 I can help you:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.example)}
                  className="w-full text-left p-3 rounded-lg transition-all hover:bg-white/20 bg-white/5 border border-white/10"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{suggestion.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{suggestion.text}</p>
                      <p className="text-xs mt-1 text-white/60">"{suggestion.example}"</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Processing */}
        <ChatRow
          targetHeight={chatMessages.length > 0 ? '160px' : '0px'}
          chatMessages={chatMessages}
          textColor="#FFFFFF"
          isDarkMode={true}
        />

        {/* Messages History */}
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-sm text-white/60">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[85%] rounded-lg p-3 border border-white/10"
                  style={{
                    backgroundColor: message.role === 'user' ? '#ffffff' : '#000000',
                    color: message.role === 'user' ? '#000000' : '#ffffff',
                  }}
                >
                  {message.role === 'assistant' ? renderMessageContent(message.content) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : null}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <textarea
            className="w-full rounded-lg p-3 text-sm resize-none outline-none mb-2 bg-black text-white border border-white/10"
            style={{ minHeight: '100px' }}
            placeholder="Tell me anything... (e.g., Create a plan, Log activity, Ask questions)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60">
              Press Enter to send • Shift+Enter for new line
            </span>
            <button
              onClick={handleSendMessage}
              disabled={isProcessing}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-white/90 disabled:opacity-50 bg-white text-black"
            >
              {isProcessing ? 'THINKING...' : 'SEND'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
