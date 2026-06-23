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

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

export default function MyPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication and get user
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      // Redirect to home if not signed in
      router.push('/');
    }
  }, [router]);

  // Fetch plans when user is available
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
    // Navigate to plan-detail with plan id
    router.push(`/plan-detail/${plan.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'PAUSED':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'NOT_STARTED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const handleDeleteClick = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation();
    setPlanToDelete(plan);
  };

  const confirmDelete = async () => {
    if (!planToDelete || !user?.email) return;

    setIsDeleting(true);
    try {
      // Use POST request with body to send email (since DELETE body is not always supported)
      const response = await fetch(`/api/plans/${planToDelete.id}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        // Refresh the plans list
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

  // Base dimensions for planner-style frame
  const baseWidth = 402;
  const baseHeight = 874;

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-40 h-6 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4 relative">
      {/* Planner-style iPhone Frame */}
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh'
        }}
      >
        <div
          className="w-full h-full flex flex-col overflow-y-auto"
          style={{ backgroundColor: '#0b0b0bff' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start gap-4">
              <BurgerMenuButton />
              <div className="flex-1 min-w-0">
                <h1
                  className="text-white font-bold"
                  style={{
                    fontFamily: 'var(--font-hanalei-fill)',
                    fontSize: '2.5rem'
                  }}
                >
                  My Plans
                </h1>
                <p className="text-gray-400 mt-2">
                  {plans.length === 0 ? 'No plans yet' : `You have ${plans.length} plan${plans.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Plans List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="text-gray-500 text-6xl">📋</div>
                <div className="text-gray-400">
                  <p className="text-lg">No plans created yet!</p>
                  <button
                    onClick={() => router.push('/planner')}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
                  >
                    Create Your First Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanClick(plan)}
                    className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-700 hover:border-purple-500/50 hover:bg-[#222222] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">
                            {plan.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border whitespace-nowrap ${getStatusColor(plan.status)}`}>
                            {getStatusLabel(plan.status)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {plan.prompt}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(plan.createdAt).toLocaleDateString()} • {new Date(plan.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col justify-between items-end">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 5l7 7-7 7"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <button
                          onClick={(e) => handleDeleteClick(e, plan)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                          aria-label="Delete plan"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14M10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-700 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">Delete Plan?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this plan? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanToDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}