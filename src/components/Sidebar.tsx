'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
  name: string;
  picture?: string | null;
}

interface Plan {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlans, setActivePlans] = useState<Plan[]>([]);

  // Fetch plans for user
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
    }
  };

  // Check for user data on mount and periodically
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const userStr = localStorage.getItem('synapse_user');
      const token = localStorage.getItem('synapse_token');
      setHasToken(!!token);
      if (userStr) {
        const newUser = JSON.parse(userStr);
        // Only update user if it's actually different
        setUser(prevUser => {
          if (JSON.stringify(prevUser) === JSON.stringify(newUser)) {
            return prevUser;
          }
          return newUser;
        });
      }
    };
    checkAuth();
    // Check every 500ms for auth changes
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, []);

  // Fetch plans when user is available
  useEffect(() => {
    fetchPlans();
  }, [user]);

  // Filter active plans (IN_PROGRESS)
  useEffect(() => {
    setActivePlans(plans.filter(p => p.status === 'IN_PROGRESS'));
  }, [plans]);

  const handleLogout = () => {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
    setHasToken(false);
    setUser(null);
    setIsOpen(false);
    router.push('/');
  };

  if (!mounted) return null;
  if (!hasToken) return null;

  return (
    <>
      {/* Burger Menu Button - Only when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg shadow-lg hover:scale-110 transition-transform"
          style={{
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
            border: '2px solid rgba(59, 130, 246)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] z-[50] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Close Button + Profile Section at Top */}
          <div className="mb-8 border-b border-gray-700 pb-6">
            <button
              onClick={() => setIsOpen(false)}
              className="mb-4 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {user?.name || user?.email || 'User'}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/planner');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Planner
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/my-plans');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              My Plans
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/plan-progress-tracker');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Plan Progress
            </button>

            {/* Active Plans Section */}
            {activePlans.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 px-4 mb-2 uppercase tracking-wider">
                  Active Plans
                </p>
                <div className="flex flex-col gap-1">
                  {activePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/plan-progress-tracker?planId=${plan.id}`);
                      }}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="truncate">{plan.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout at Bottom */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}