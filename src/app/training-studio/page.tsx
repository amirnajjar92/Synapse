'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import PromptBoxOpenAI from '@/components/PromptBoxOpenAI';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import MuscleMapDisplay from '@/components/MuscleMapDisplay';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  planStatus: 'none' | 'active' | 'paused';
  lastMessage?: string;
  lastMessageTime?: string;
  trainerClientId?: string;
}

interface ChatMessage {
  id: string;
  senderId: 'trainer' | string;
  text: string;
  timestamp: string;
}

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: any[];
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface PlanDayEntry {
  id: string;
  day: string;
  focus: string;
  exercises: string;
  duration: string;
}

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

type Tab = 'dashboard' | 'builder' | 'repository' | 'messages';

export default function TrainingStudio() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [builderPrompt, setBuilderPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [builderMessages, setBuilderMessages] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planDays, setPlanDays] = useState<PlanDayEntry[]>([]);
  const [newDay, setNewDay] = useState('');
  const [newFocus, setNewFocus] = useState('');
  const [newExercises, setNewExercises] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userEmailRef = useRef<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('synapse_token');
    const userStr = localStorage.getItem('synapse_user');
    setIsSignedIn(!!token);
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserEmail(user.email);
      setUserId(user.id);
      userIdRef.current = user.id;
      userEmailRef.current = user.email;
      fetchPlans(user.email);
      fetchClients(user.email);
    }
  }, []);

  const fetchClients = async (email: string) => {
    if (!email) return;
    try {
      setIsLoadingClients(true);
      const response = await fetch(`/api/training/clients?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setActiveClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchPlans = async (email: string) => {
    if (!email) return;
    try {
      const response = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (activeClients.length > 0 && !selectedClient) {
      setSelectedClient(activeClients[0].id);
    }
  }, [activeClients, selectedClient]);

  useEffect(() => {
    if (selectedClient && userEmail) {
      fetchMessages(selectedClient);
    } else {
      setChatMessages([]);
    }
  }, [selectedClient, userEmail]);

  const fetchMessages = async (clientId: string) => {
    if (!userEmail || !clientId) return;
    try {
      const response = await fetch(`/api/training/conversations/${clientId}?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
        setConversationId(data.conversationId || null);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Pusher real-time subscription for trainer chat
  useEffect(() => {
    if (!conversationId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    let pusher: any;
    let channel: any;

    const initPusher = async () => {
      const PusherJS = (await import('pusher-js')).default;
      pusher = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true,
      });
      channel = pusher.subscribe(`chat-${conversationId}`);
      channel.bind('new-message', (data: any) => {
        if (data.senderEmail === userEmailRef.current) return;
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          const isOwn = data.senderEmail === userEmailRef.current;
          return [...prev, {
            id: data.id,
            senderId: isOwn ? 'trainer' as const : data.senderId,
            senderName: data.senderName,
            text: data.text,
            timestamp: data.timestamp,
          }];
        });
      });
    };
    initPusher();

    return () => {
      if (channel) { channel.unbind_all(); channel.unsubscribe(); }
      if (pusher) pusher.disconnect();
    };
  }, [conversationId, userId]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    try {
      await signIn('google', { callbackUrl: window.location.href });
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || !selectedClient || !userEmail) return;
    const text = chatInput.trim();
    setChatInput('');

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'trainer',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      const response = await fetch(`/api/training/conversations/${selectedClient}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, text }),
      });
      if (response.ok) {
        const data = await response.json();
        // Replace optimistic message with real one
        setChatMessages(prev =>
          prev.map(msg => msg.id === optimisticMsg.id ? data.message : msg)
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on failure
      setChatMessages(prev => prev.filter(msg => msg.id !== optimisticMsg.id));
    }
  }, [chatInput, selectedClient, userEmail]);

  const handleGeneratePlan = useCallback(async () => {
    if (!builderPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedPlan(null);
    setBuilderMessages([]);

    const thinkingSteps = [
      'Analyzing your training requirements...',
      'Considering optimal exercise selection...',
      'Balancing volume and intensity...',
      'Structuring weekly split...',
      'Finalizing your personalized plan...',
    ];

    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setBuilderMessages(prev => [...prev, `AI: ${thinkingSteps[i]}`]);
    }

    await new Promise(r => setTimeout(r, 600));
    setGeneratedPlan('Plan generated successfully! Review and customize below.');
    setPlanTitle(`${builderPrompt.trim().split(' ').slice(0, 4).join(' ')} Plan`);
    setPlanDays([
      {
        id: '1',
        day: 'Monday',
        focus: 'Chest & Triceps',
        exercises: 'Bench Press: 4x8-10\nIncline DB Press: 3x10-12\nCable Flyes: 3x12\nTricep Pushdown: 3x12\nOverhead Tricep Ext: 3x10',
        duration: '45 min',
      },
      {
        id: '2',
        day: 'Tuesday',
        focus: 'Back & Biceps',
        exercises: 'Pull-ups: 3xAMRAP\nBarbell Row: 4x8-10\nLat Pulldown: 3x10\nDB Curl: 3x12\nHammer Curl: 3x10',
        duration: '45 min',
      },
      {
        id: '3',
        day: 'Thursday',
        focus: 'Legs & Core',
        exercises: 'Squats: 4x8-10\nRomanian Deadlift: 3x10-12\nLeg Press: 3x12\nPlank: 3x30s\nCable Crunch: 3x15',
        duration: '50 min',
      },
      {
        id: '4',
        day: 'Friday',
        focus: 'Shoulders & Arms',
        exercises: 'Overhead Press: 4x8-10\nLateral Raise: 3x12\nFace Pull: 3x15\nSkull Crushers: 3x10\nEZ Bar Curl: 3x10',
        duration: '45 min',
      },
    ]);
    setIsGenerating(false);
  }, [builderPrompt]);

  const handleAddDay = useCallback(() => {
    if (!newDay.trim() || !newExercises.trim()) return;
    if (editingDayIdx !== null) {
      setPlanDays(prev => prev.map((d, i) =>
        i === editingDayIdx ? { ...d, day: newDay.trim(), focus: newFocus.trim(), exercises: newExercises.trim(), duration: newDuration.trim() } : d
      ));
      setEditingDayIdx(null);
    } else {
      setPlanDays(prev => [...prev, {
        id: String(Date.now()),
        day: newDay.trim(),
        focus: newFocus.trim(),
        exercises: newExercises.trim(),
        duration: newDuration.trim(),
      }]);
    }
    setNewDay('');
    setNewFocus('');
    setNewExercises('');
    setNewDuration('');
  }, [newDay, newFocus, newExercises, newDuration, editingDayIdx]);

  const handleEditDay = useCallback((index: number) => {
    const day = planDays[index];
    setNewDay(day.day);
    setNewFocus(day.focus);
    setNewExercises(day.exercises);
    setNewDuration(day.duration);
    setEditingDayIdx(index);
  }, [planDays]);

  const handleRemoveDay = useCallback((index: number) => {
    setPlanDays(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleInviteClient = useCallback(async () => {
    if (!inviteEmail.trim() || !userEmail) return;
    setIsInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const response = await fetch('/api/training/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerEmail: userEmail, clientEmail: inviteEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setInviteError(data.error || 'Failed to send invitation');
      } else {
        setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
        setInviteEmail('');
      }
    } catch (error) {
      setInviteError('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  }, [inviteEmail, userEmail]);

  const handleAssignToClient = useCallback(async (trainerClientId: string) => {
    if (!userEmail || !planTitle.trim() || planDays.length === 0) return;
    setIsAssigning(true);
    try {
      const tables = [{
        title: 'WORKOUT PLAN',
        rows: planDays.map(d => ({
          columns: [d.day, d.focus, d.exercises, d.duration],
        })),
      }];
      const planRes = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          title: planTitle.trim(),
          prompt: builderPrompt || `Custom plan: ${planTitle}`,
          icon: '/vectors/workout-icon.svg',
          tables,
        }),
      });
      if (!planRes.ok) throw new Error('Failed to create plan');
      const planData = await planRes.json();
      const planId = planData.plan.id;

      await fetch(`/api/training/clients/${trainerClientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, planStatus: 'ACTIVE', assignedPlanId: planId }),
      });

      setGeneratedPlan(null);
      setPlanDays([]);
      setPlanTitle('');
      setBuilderPrompt('');
      setShowAssignModal(false);

      fetchClients(userEmail);
      fetchPlans(userEmail);
    } catch (error) {
      console.error('Error assigning plan:', error);
    } finally {
      setIsAssigning(false);
    }
  }, [userEmail, planTitle, planDays, builderPrompt]);

  const handleSaveToRepository = useCallback(async () => {
    if (!userEmail || !planTitle.trim() || planDays.length === 0) return;
    try {
      const tables = [{
        title: 'WORKOUT PLAN',
        rows: planDays.map(d => ({
          columns: [d.day, d.focus, d.exercises, d.duration],
        })),
      }];
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          title: planTitle.trim(),
          prompt: builderPrompt || `Custom plan: ${planTitle}`,
          icon: '/vectors/workout-icon.svg',
          tables,
        }),
      });
      if (!res.ok) throw new Error('Failed to save plan');
      setGeneratedPlan(null);
      setPlanDays([]);
      setPlanTitle('');
      setBuilderPrompt('');
      fetchPlans(userEmail);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  }, [userEmail, planTitle, planDays, builderPrompt]);

  if (!isSignedIn) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
        <div className="w-full max-w-[402px] h-full max-h-[874px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col">
          <MuscleMapDisplay />
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl overflow-hidden">
              <div className="text-center p-8 pb-6 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white mb-2">Training Studio</h1>
                <p className="text-lg text-white/60">Sign in to manage clients and build plans</p>
              </div>
              <div className="p-8 space-y-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSigningIn ? <Spinner size={20} /> : 'Sign in with Google'}
                </button>
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      <div className="w-full max-w-[402px] h-full max-h-[874px] bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col">
        <MuscleMapDisplay />
        <div className="absolute inset-0 z-10 flex flex-col" style={{ backgroundColor: '#0b0b0b4D' }}>
          <div className="absolute top-4 left-4 z-20">
            <BurgerMenuButton />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-14 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FC4C02] to-orange-500 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Training Studio</h1>
                <p className="text-white/50 text-xs">Create, manage & share plans</p>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="flex bg-white/5 rounded-xl p-1 gap-1">
              {[
                { id: 'dashboard' as Tab, label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
                { id: 'builder' as Tab, label: 'Build Plan', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
                { id: 'repository' as Tab, label: 'Repository', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6M9 14h1M15 14h1M9 19h1M15 19h1' },
                { id: 'messages' as Tab, label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d={tab.icon} />
                    </svg>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden px-4 pb-4">
            {activeTab === 'repository' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h2 className="text-white font-semibold text-sm">Your Plans</h2>
                  <span className="text-white/40 text-xs">{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
                  {isLoadingPlans ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Spinner size={36} />
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-xs">No plans yet</p>
                      <button
                        onClick={() => setActiveTab('builder')}
                        className="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Create Your First Plan
                      </button>
                    </div>
                  ) : (
                    plans.map((plan) => {
                      const isWorkoutPlan = plan.tables?.some(t => t.title === 'WORKOUT PLAN');
                      const handlePlanClick = () => {
                        if (isWorkoutPlan) {
                          router.push('/workout-tracker?planId=' + plan.id);
                        } else {
                          router.push('/plan-detail/' + plan.id);
                        }
                      };
                      return (
                        <div
                          key={plan.id}
                          onClick={handlePlanClick}
                          className="bg-white/5 rounded-xl p-3.5 hover:bg-white/10 transition-all cursor-pointer border border-white/5 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FC4C02]/30 flex items-center justify-center flex-shrink-0 border border-[#FC4C02]/20">
                              {isWorkoutPlan ? (
                                <img src="/vectors/workout-icon.svg" alt="workout" className="w-5 h-5 opacity-70 brightness-0 invert" />
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="12" y1="18" x2="12" y2="12" />
                                  <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-white font-semibold text-sm truncate">{plan.title}</h3>
                                <span className={
                                  "px-1.5 py-0.5 text-[8px] font-medium rounded-full whitespace-nowrap border " +
                                  (plan.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                    plan.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                                      plan.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                        'bg-gray-500/20 text-gray-400 border-gray-500/50')
                                }>
                                  {plan.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              {plan.prompt && (
                                <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2">{plan.prompt}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Share plan:', plan.id);
                                }}
                                className="p-1.5 text-white/40 hover:text-[#FC4C02] transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Share plan"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2H12l-4 4z" />
                                  <polyline points="8 4 12 8 16 4" />
                                </svg>
                              </button>
                              <p className="text-white/50 text-[10px] text-right">
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h2 className="text-white font-semibold text-sm">Your Clients</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs">{activeClients.length} clients</span>
                    <button
                      onClick={() => {
                        setInviteEmail('');
                        setInviteError('');
                        setInviteSuccess('');
                        setShowInviteModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#FC4C02] hover:bg-[#FC4C02]/80 text-white text-[11px] font-medium rounded-lg transition-all flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      Add Client
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
                  {isLoadingClients ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Spinner size={36} />
                    </div>
                  ) : activeClients.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 00-3-3.87" />
                          <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-xs">No clients yet</p>
                    </div>
                  ) : (
                    activeClients.map(client => {
                      const statusColors = { active: 'bg-green-500', paused: 'bg-yellow-500', none: 'bg-gray-500' };
                      const statusLabels = { active: 'Active', paused: 'Paused', none: 'No Plan' };
                      return (
                        <div
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client.id);
                            setActiveTab('messages');
                          }}
                          className="bg-white/5 rounded-xl p-3.5 hover:bg-white/10 transition-all cursor-pointer border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FC4C02]/30 to-orange-500/30 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border border-white/10">
                              {client.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium text-sm truncate">{client.name}</p>
                                <div className={"w-1.5 h-1.5 rounded-full " + statusColors[client.planStatus]} />
                              </div>
                              <p className="text-white/40 text-xs truncate">{client.email}</p>
                              {client.lastMessage && (
                                <p className="text-white/30 text-xs truncate mt-0.5">{client.lastMessage}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span
                                className={
                                  "text-[10px] px-2 py-0.5 rounded-full font-medium " +
                                  (client.planStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                                    client.planStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-gray-500/20 text-gray-400')
                                }
                              >
                                {statusLabels[client.planStatus]}
                              </span>
                              {client.lastMessageTime && (
                                <span className="text-[10px] text-white/30">
                                  {new Date(client.lastMessageTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'builder' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
                  {!generatedPlan ? (
                    <>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h3 className="text-white font-semibold text-sm mb-2">AI Plan Builder</h3>
                        <p className="text-white/50 text-xs leading-relaxed mb-4">
                          Describe the plan you want to create. Include goals, duration, frequency, and any specific preferences.
                        </p>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Strength 4x/week', desc: 'Build raw strength with compound lifts' },
                              { label: 'Hypertrophy 5x/week', desc: 'Maximize muscle growth & size' },
                              { label: 'Full Body 3x/week', desc: 'Balanced full-body program' },
                              { label: 'Push/Pull/Legs', desc: 'Classic PPL split 6x/week' },
                            ].map(suggestion => (
                              <button
                                key={suggestion.label}
                                onClick={() => setBuilderPrompt(suggestion.desc)}
                                className="text-left bg-white/[0.03] hover:bg-white/10 border border-white/10 rounded-lg p-2.5 transition-all"
                              >
                                <p className="text-white text-xs font-medium">{suggestion.label}</p>
                                <p className="text-white/40 text-[10px] mt-0.5">{suggestion.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h3 className="text-white font-semibold text-sm mb-3">Manual Plan Setup</h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={planTitle}
                            onChange={e => setPlanTitle(e.target.value)}
                            placeholder="Plan title (e.g. 12-Week Hypertrophy Program)"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={newDay}
                              onChange={e => setNewDay(e.target.value)}
                              placeholder="Day (e.g. Monday)"
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
                            />
                            <input
                              type="text"
                              value={newFocus}
                              onChange={e => setNewFocus(e.target.value)}
                              placeholder="Focus (e.g. Chest & Triceps)"
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
                            />
                          </div>
                          <textarea
                            value={newExercises}
                            onChange={e => setNewExercises(e.target.value)}
                            placeholder="Exercises (one per line):&#10;Bench Press: 4x8-10&#10;Incline DB Press: 3x12"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/20 resize-none"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newDuration}
                              onChange={e => setNewDuration(e.target.value)}
                              placeholder="Duration (e.g. 45 min)"
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
                            />
                            <button
                              onClick={handleAddDay}
                              disabled={!newDay.trim() || !newExercises.trim()}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white text-sm transition-all flex-shrink-0"
                            >
                              {editingDayIdx !== null ? 'Update' : 'Add Day'}
                            </button>
                          </div>
                          {planDays.length > 0 && (
                            <div className="space-y-1">
                              {planDays.map((d, i) => (
                                <div key={d.id} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 group">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white text-xs font-medium">{d.day}</span>
                                      {d.focus && <span className="text-white/40 text-[10px]">{d.focus}</span>}
                                      {d.duration && <span className="text-white/30 text-[10px]">{d.duration}</span>}
                                    </div>
                                    <p className="text-white/50 text-[10px] truncate mt-0.5">
                                      {d.exercises.split('\n').length} exercises
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleEditDay(i)}
                                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all p-1"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveDay(i)}
                                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm truncate flex-1">{planTitle || 'Untitled Plan'}</h3>
                        <button
                          onClick={() => { setGeneratedPlan(null); setPlanDays([]); }}
                          className="text-white/40 hover:text-white text-xs transition-colors ml-2 flex-shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-white/60 text-xs mb-3">{generatedPlan}</p>
                      <div className="space-y-3">
                        {planDays.map((d) => (
                          <div key={d.id} className="bg-white/[0.03] rounded-lg px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-xs font-semibold">{d.day}</span>
                                {d.focus && <span className="text-white/50 text-[10px]">| {d.focus}</span>}
                              </div>
                              {d.duration && <span className="text-white/30 text-[10px]">{d.duration}</span>}
                            </div>
                            <div className="space-y-0.5">
                              {d.exercises.split('\n').filter(Boolean).map((ex, ei) => (
                                <div key={ei} className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50 flex-shrink-0">{ei + 1}</span>
                                  <span className="text-white/70 text-[11px]">{ex}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="flex-1 py-2.5 bg-gradient-to-r from-[#FC4C02] to-orange-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
                        >
                          Assign to Client
                        </button>
                        <button
                          onClick={handleSaveToRepository}
                          className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all"
                        ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Prompt Input at bottom */}
                <div className="flex-shrink-0 pt-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={builderPrompt}
                      onChange={e => setBuilderPrompt(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGeneratePlan(); } }}
                      placeholder="Describe the plan you want to build..."
                      disabled={isGenerating}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-white/20 disabled:opacity-50"
                    />
                    <button
                      onClick={handleGeneratePlan}
                      disabled={!builderPrompt.trim() || isGenerating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ backgroundColor: builderPrompt.trim() && !isGenerating ? '#FC4C02' : 'transparent' }}
                    >
                      {isGenerating ? (
                        <Spinner size={16} />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="h-full flex flex-col">
                {/* Client selector pills */}
                <div className="flex-shrink-0 mb-3 overflow-x-auto scrollbar-none">
                  <div className="flex gap-1.5 pb-1">
                    {activeClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedClient === client.id ? 'bg-[#FC4C02] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        {client.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Message Window */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-white/30 text-xs">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isTrainer = msg.senderId === 'trainer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isTrainer ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${isTrainer ? 'bg-[#FC4C02] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-white/30 mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex-shrink-0 pt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
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
          </div>
        </div>
      </div>

      {/* Invite Client Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Invite Client</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-white/50 text-xs">
                Enter the email of the user you want to add as a client. They will receive an invitation to accept.
              </p>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleInviteClient(); }}
                placeholder="client@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-white/20"
              />
              {inviteError && (
                <p className="text-red-400 text-xs">{inviteError}</p>
              )}
              {inviteSuccess && (
                <p className="text-green-400 text-xs">{inviteSuccess}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteClient}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="flex-1 py-2.5 bg-[#FC4C02] hover:bg-[#FC4C02]/80 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan to Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Assign &ldquo;{planTitle}&rdquo; to</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {activeClients.filter(c => c.planStatus !== 'active').length === 0 ? (
                <div className="p-4 text-center text-white/40 text-xs">
                  All clients already have active plans
                </div>
              ) : (
                activeClients.filter(c => c.planStatus !== 'active').map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleAssignToClient(client.trainerClientId || client.id)}
                    disabled={isAssigning}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FC4C02]/30 to-orange-500/30 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 border border-white/10">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{client.name}</p>
                      <p className="text-white/40 text-[11px] truncate">{client.email}</p>
                    </div>
                    <span className={
                      "text-[10px] px-2 py-0.5 rounded-full font-medium " +
                      (client.planStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400')
                    }>
                      {client.planStatus === 'paused' ? 'Paused' : 'No Plan'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}