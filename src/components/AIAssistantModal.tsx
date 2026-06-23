'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ChatRow from './ChatRow';
import { getTheme, loadTheme } from '@/lib/theme';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [borderRadius, setBorderRadius] = useState('40px');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
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
        // Store conversation ID for future messages
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

          // Load last messages
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

  // Load history when modal opens
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Delay animation start to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHasAnimatedIn(true);
        });
      });
      
      if (messages.length === 0) {
        loadConversationHistory();
      }
    } else {
      setHasAnimatedIn(false);
      // Keep rendered during exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
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

  // Adaptive border radius
  useEffect(() => {
    const updateBorderRadius = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const minDimension = Math.min(vh, vw);
      
      if (minDimension < 400) setBorderRadius('20px');
      else if (minDimension < 600) setBorderRadius('30px');
      else setBorderRadius('40px');
    };

    updateBorderRadius();
    window.addEventListener('resize', updateBorderRadius);
    return () => window.removeEventListener('resize', updateBorderRadius);
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMessages]);

  // Get context-aware suggestions based on current page
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
    } else if (pathname?.includes('/plan-progress-tracker')) {
      return [
        { icon: '✅', text: 'Update progress', example: 'Completed today\'s workout' },
        { icon: '📊', text: 'Analyze plan progress', example: 'How well am I following my plan?' },
        { icon: '🎯', text: 'Adjust goals', example: 'Modify my target weight' },
      ];
    }
    return [
      { icon: '🎯', text: 'Create a fitness plan', example: 'Create a 30-day plan to lose 5kg' },
      { icon: '📊', text: 'Log an activity', example: 'Ran 10km in 50 minutes' },
      { icon: '💡', text: 'Ask me anything', example: 'What should I eat after workout?' },
    ];
  };

  const suggestions = getContextSuggestions();

  // Handle suggestion click
  const handleSuggestionClick = (example: string) => {
    setUserInput(example);
  };

  // Start new conversation
  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setChatMessages([]);
    setIsLoadingHistory(false);
  };

  // Handle sending message to unified AI endpoint
  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    // Save user message to DB
    await saveMessageToDb('user', userMessage.content);

    // Clear previous chat messages for clean response
    setChatMessages([`You: ${userInput.trim()}`]);
    setUserInput('');
    setIsProcessing(true);

    try {
      // Get user info
      const userStr = localStorage.getItem('synapse_user');
      if (!userStr) {
        throw new Error('User not authenticated');
      }
      const user = JSON.parse(userStr);

      // Call unified AI routing endpoint
      setChatMessages(prev => [...prev, '🤖 Analyzing your request...']);

      const response = await fetch('/api/ai/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          message: userMessage.content,
          context: {
            page: pathname,
            conversationHistory: messages.slice(-5), // Last 5 messages for context
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process request');
      }

      const data = await response.json();

      // Clear chat messages before showing new response
      setChatMessages([]);

      // Update chat messages based on response
      if (data.intent) {
        setChatMessages(prev => [...prev, `🎯 Detected: ${data.intent.replace(/_/g, ' ')}`]);
      }

      if (data.processing) {
        setChatMessages(prev => [...prev, `⚙️ ${data.processing}`]);
      }

      // Add assistant response to messages
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Task completed successfully!',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setChatMessages(prev => [...prev, `✅ ${data.response || 'Done!'}`]);

      // Save assistant message to DB
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

      // Handle navigation links if provided
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
      // Save error message to DB
      await saveMessageToDb('assistant', errorMessage.content);
      setChatMessages([]);
      setChatMessages(['❌ Error occurred. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle navigation from response links
  const handleNavigationClick = (path: string) => {
    router.push(path);
    onClose();
  };

  // Parse response text for navigation links
  const renderMessageContent = (content: string) => {
    // Check for navigation patterns like "Go to /planner" or "Visit Monitor page"
    let processedContent = content;
    const links: Array<{ text: string; path: string }> = [];

    // Extract markdown-style links
    const markdownMatches = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    markdownMatches.forEach(match => {
      const [fullMatch, text, path] = match;
      if (path.startsWith('/')) {
        links.push({ text, path });
        processedContent = processedContent.replace(fullMatch, text);
      }
    });

    // Extract path mentions
    const pathMatches = [...content.matchAll(/(?:go to|visit|check|see|navigate to)\s+(\/[\w-]+)/gi)];
    pathMatches.forEach(match => {
      const path = match[1];
      links.push({ text: `Go to ${path}`, path });
    });

    // Extract page name mentions
    const pageMap: { [key: string]: string } = {
      'planner': '/planner',
      'monitor': '/monitor',
      'progress tracker': '/plan-progress-tracker',
      'progress': '/plan-progress-tracker',
      'water tracker': '/water-tracker',
      'water': '/water-tracker',
      'events': '/events',
      'entertain': '/entertain',
      'my plans': '/my-plans',
      'plans': '/my-plans',
    };

    const pageMatches = [...content.matchAll(/(?:planner|monitor|progress|water|events|entertain|plans)\s+page/gi)];
    pageMatches.forEach(match => {
      const pageName = match[0].replace(/\s+page$/i, '').toLowerCase();
      if (pageMap[pageName]) {
        links.push({ text: `Visit ${match[0]}`, path: pageMap[pageName] });
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

  const baseWidth = 402;
  const baseHeight = 874;

  // Don't render at all if never opened
  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        opacity: hasAnimatedIn ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="overflow-hidden shadow-2xl absolute top-1/2 flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          height: `min(95vh, ${baseHeight}px)`,
          maxHeight: '95vh',
          borderRadius: borderRadius,
          backgroundColor: '#000000',
          border: '0.75px solid #ffffff',
          right: hasAnimatedIn ? '50%' : '-100%',
          transform: hasAnimatedIn ? 'translate(50%, -50%)' : 'translate(50%, -50%)',
          opacity: hasAnimatedIn ? 1 : 0,
          transition: 'right 500ms ease-out, opacity 500ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full flex flex-col relative">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: '0.75px solid #ffffff' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center" style={{ border: '0.75px solid #000000' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-semibold text-white"
                  style={{
                    fontFamily: 'var(--font-hanalei-fill)',
                  }}
                >
                  AI Assistant
                </h3>
                <p className="text-xs text-white/60">
                  Your fitness companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* New Conversation Button */}
              {messages.length > 0 && (
                <button
                  onClick={startNewConversation}
                  className="p-2 rounded-full transition-colors hover:bg-white/20 text-xs bg-white/10"
                  style={{
                    color: '#ffffff',
                  }}
                  title="Start new conversation"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 bg-white/10 text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Suggestions Section - Show when no messages */}
          {messages.length === 0 && (
            <div className="p-4" style={{ borderBottom: '0.75px solid #ffffff' }}>
              <p
                className="text-sm font-medium mb-3 text-white"
              >
                💡 I can help you:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.example)}
                    className="w-full text-left p-3 rounded-lg transition-all hover:bg-white/20 bg-white/5"
                    style={{
                      border: '0.75px solid #ffffff',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-white"
                        >
                          {suggestion.text}
                        </p>
                        <p className="text-xs mt-1 text-white/60">
                          "{suggestion.example}"
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Chat Processing */}
          <ChatRow
            targetHeight={chatMessages.length > 0 ? '160px' : '0px'}
            chatMessages={chatMessages}
            textColor={currentTheme === 'light' ? '#000000' : '#FFFFFF'}
            isDarkMode={currentTheme === 'dark'}
          />

          {/* Messages History */}
          {isLoadingHistory ? (
            <div
              className="flex-1 flex items-center justify-center bg-black"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-10 h-10">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#ffffff transparent transparent transparent' }}
                  />
                </div>
                <p className="text-sm text-white/60">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 ai-messages-scrollbar bg-black"
              style={{ 
                maxHeight: 'calc(100vh - 400px)',
                overflowY: 'auto',
                scrollBehavior: 'smooth'
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] rounded-lg p-3"
                    style={{
                      backgroundColor: message.role === 'user' ? '#ffffff' : '#000000',
                      border: '0.75px solid #ffffff',
                      color: message.role === 'user' ? '#000000' : '#ffffff',
                    }}
                  >
                    {message.role === 'assistant' ? renderMessageContent(message.content) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p
                      className="text-xs mt-1"
                      style={{ 
                        color: message.role === 'user' ? '#000000' : '#ffffff',
                        opacity: 0.6 
                      }}
                    >
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
          <div className="px-3 pt-2 pb-0" style={{ borderTop: '0.75px solid #ffffff' }}>
            <textarea
              className="w-full rounded-lg p-3 text-sm resize-none outline-none mb-2 transition-colors bg-black text-white"
              style={{
                border: '0.75px solid #ffffff',
                minHeight: '100px',
              }}
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
            <div className="flex justify-between items-center pb-3">
              <span className="text-xs text-white/60">
                Press Enter to send • Shift+Enter for new line
              </span>
              <button
                onClick={handleSendMessage}
                disabled={isProcessing}
                className="px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-white/90 disabled:opacity-50 bg-white text-black"
                style={{ border: '0.75px solid #000000' }}
              >
                {isProcessing ? 'THINKING...' : 'SEND'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
