'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';

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

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function MyPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchPlans = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const handlePlanClick = (plan: Plan) => {
    const isWorkoutPlan = plan.tables?.some((t: { title?: string }) => t?.title === 'WORKOUT PLAN');
    if (isWorkoutPlan) {
      router.push(`/workout-tracker?planId=${plan.id}`);
      return;
    }
    router.push(`/plan-detail/${plan.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'PAUSED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'NOT_STARTED': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status: string) => status.replace(/_/g, ' ');

  const handleDeleteClick = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation();
    setPlanToDelete(plan);
  };

  const confirmDelete = async () => {
    if (!planToDelete || !user?.email) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plans/${planToDelete.id}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (response.ok) {
        await fetchPlans();
        setPlanToDelete(null);
      } else {
        throw new Error('Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: '#0b0b0b4D' }}>
          <div className="absolute top-4 left-4 z-10">
            <BurgerMenuButton />
          </div>

          <div className="flex-1 flex flex-col min-h-0 px-4 pt-16 pb-4">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h1
                className="text-white font-bold"
                style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '19px', lineHeight: '1' }}
              >
                MY PLANS
              </h1>
              <span className="text-[10px] text-gray-500">
                {plans.length} plan{plans.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner size={36} />
              </div>
            ) : plans.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs">No plans yet</p>
                <button
                  onClick={() => router.push('/planner')}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                {plans.map((plan) => {
                  const isWorkoutPlan = plan.tables?.some((t: { title?: string }) => t?.title === 'WORKOUT PLAN');
                  const isCardioPlan = !isWorkoutPlan;
                  return (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanClick(plan)}
                    className="bg-gray-800/50 hover:bg-gray-700/60 rounded-xl px-3 py-2.5 border border-[#3B3B3B00] hover:border-gray-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-white text-[13px] font-semibold truncate">{plan.title}</h3>
                          <span className={`px-1.5 py-0.5 text-[8px] font-medium rounded-full border whitespace-nowrap ${getStatusColor(plan.status)}`}>
                            {getStatusLabel(plan.status)}
                          </span>
                        </div>
                        {plan.prompt && (
                          <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{plan.prompt}</p>
                        )}
                        <p className="text-gray-600 text-[9px] mt-1">
                          {new Date(plan.createdAt).toLocaleDateString()} • {new Date(plan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                        <button
                          onClick={(e) => handleDeleteClick(e, plan)}
                          className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                          aria-label="Delete plan"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {isWorkoutPlan && (
                          <img
                            src="/vectors/workout-icon.svg"
                            alt=""
                            className="w-[18px] h-[18px] opacity-70 brightness-0 invert mt-1"
                          />
                        )}
                        {isCardioPlan && (
                          <img
                            src="/vectors/cardio-icon.svg"
                            alt=""
                            className="w-[18px] h-[18px] opacity-70 brightness-0 invert mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </div>
        </div>
      </div>

      {planToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-800 shadow-2xl">
            <h3 className="text-white font-bold text-sm mb-1">Delete Plan?</h3>
            <p className="text-gray-400 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-semibold hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal links for SEO */}
      <nav className="sr-only" aria-label="Internal navigation">
        <a href="/">Home</a>
        <a href="/planner">Workout Planner</a>
        <a href="/workout-tracker">Workout Tracker</a>
        <a href="/blog">Fitness Blog</a>
      </nav>

      <FloatingNavBar />
    </div>
  );
}
