'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  tables: any[];
  createdAt: string;
  updatedAt: string;
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
  useEffect(() => {
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

    fetchPlans();
  }, [user]);

  const handlePlanClick = (plan: Plan) => {
    // Navigate to plan-detail with plan id
    router.push(`/plan-detail/${plan.id}`);
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {plan.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {plan.prompt}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(plan.createdAt).toLocaleDateString()} • {new Date(plan.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 5l7 7-7 7"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}