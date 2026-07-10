'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';

interface Trainer {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string | null;
  text: string;
  timestamp: string;
}

interface Conversation {
  trainer: Trainer;
  assignedPlan: { id: string; title: string } | null;
  messages: Message[];
}

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function TrainingChatPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressFiredRef = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserEmail(u.email);
      } catch { /* ignore */ }
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/training/client-conversations?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [conversations, activeIdx]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !userEmail || conversations.length === 0) return;

    const conversation = conversations[activeIdx];
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      senderId: 'me',
      senderName: null,
      text,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => {
      const updated = [...prev];
      updated[activeIdx] = { ...updated[activeIdx], messages: [...updated[activeIdx].messages, optimistic] };
      return updated;
    });
    setInputText('');
    setSending(true);

    try {
      const res = await fetch('/api/training/client-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, trainerId: conversation.trainer.id, text }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(prev => {
          const updated = [...prev];
          updated[activeIdx] = {
            ...updated[activeIdx],
            messages: updated[activeIdx].messages.map(m => m.id === optimistic.id ? data.message : m),
          };
          return updated;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setConversations(prev => {
        const updated = [...prev];
        updated[activeIdx] = {
          ...updated[activeIdx],
          messages: updated[activeIdx].messages.filter(m => m.id !== optimistic.id),
        };
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMsg = async (messageId: string) => {
    setDeletingMsgId(null);
    setConversations(prev => {
      const updated = [...prev];
      updated[activeIdx] = {
        ...updated[activeIdx],
        messages: updated[activeIdx].messages.filter(m => m.id !== messageId),
      };
      return updated;
    });
    try {
      await fetch(`/api/training/messages/${messageId}?email=${encodeURIComponent(userEmail!)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const activeConv = conversations[activeIdx];

  return (
    <div className="min-h-screen bg-black flex items-start justify-center">
      <div className="w-full max-w-[402px] min-h-screen bg-black relative flex flex-col"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05)' }}>
        <BurgerMenuButton />

        <div className="px-4 pt-16 pb-4">
          <h1 className="text-white text-lg font-bold">Training Chat</h1>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Spinner /></div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm font-medium mb-1">No trainers yet</p>
            <p className="text-white/30 text-xs">Accept a training invitation to start chatting with your coach.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-4 pb-4">
            {conversations.length > 1 && (
              <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none flex-shrink-0">
                {conversations.map((conv, i) => (
                  <button
                    key={conv.trainer.id}
                    onClick={() => setActiveIdx(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${i === activeIdx ? 'bg-[#FC4C02] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {conv.trainer.name || conv.trainer.email}
                  </button>
                ))}
              </div>
            )}

            {activeConv?.assignedPlan && (
              <button
                onClick={() => router.push(`/workout-tracker?planId=${activeConv.assignedPlan!.id}`)}
                className="flex-shrink-0 mb-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 transition-all text-left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC4C02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{activeConv.assignedPlan.title}</p>
                  <p className="text-white/40 text-[10px]">Assigned plan — tap to track</p>
                </div>
              </button>
            )}

            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {activeConv.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-white/30 text-xs px-4">
                  No messages yet. Say hello to your trainer!
                </div>
              ) : (
                activeConv.messages.map(msg => {
                  const isMe = msg.senderId === 'me';
                  const showDelete = isMe && deletingMsgId === msg.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 max-w-[85%]">
                        {showDelete && (
                          <button
                            onClick={() => handleDeleteMsg(msg.id)}
                            className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center flex-shrink-0 transition-colors"
                            title="Delete message"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-xs ${isMe ? 'bg-[#FC4C02] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}
                          onContextMenu={e => { if (isMe) { e.preventDefault(); setDeletingMsgId(showDelete ? null : msg.id); } }}
                          onPointerDown={() => {
                            if (!isMe) return;
                            longPressFiredRef.current = false;
                            longPressTimerRef.current = setTimeout(() => {
                              longPressFiredRef.current = true;
                              setDeletingMsgId(msg.id);
                            }, 500);
                          }}
                          onPointerUp={() => { clearTimeout(longPressTimerRef.current); }}
                          onPointerLeave={() => { clearTimeout(longPressTimerRef.current); }}
                          onPointerCancel={() => { clearTimeout(longPressTimerRef.current); }}
                          onClick={() => { if (showDelete && !longPressFiredRef.current) setDeletingMsgId(null); }}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <span className="text-[9px] text-white/30 mt-0.5 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex-shrink-0 pt-3 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="w-10 h-10 rounded-xl bg-[#FC4C02] disabled:opacity-30 text-white flex items-center justify-center transition-opacity flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Internal links for SEO */}
        <nav className="sr-only" aria-label="Internal navigation">
          <a href="/">Home</a>
          <a href="/planner">Workout Planner</a>
          <a href="/workout-planner">Workout Builder</a>
          <a href="/blog">Fitness Blog</a>
        </nav>

        <FloatingNavBar />
      </div>
    </div>
  );
}
