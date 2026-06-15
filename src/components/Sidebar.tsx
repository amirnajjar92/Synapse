'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useSession, signIn } from 'next-auth/react';

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
  const { isOpen, setIsOpen } = useSidebar();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlans, setActivePlans] = useState<Plan[]>([]);
  // Strava integration (disabled for now)
  // const [isStravaConnected, setIsStravaConnected] = useState(false);
  // const [isSyncing, setIsSyncing] = useState(false);

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

  // Strava integration (disabled for now)
  /*
  // Check Strava connection status
  const checkStravaStatus = async () => {
    try {
      const res = await fetch('/api/strava/status');
      const data = await res.json();
      setIsStravaConnected(data.connected);
    } catch (err) {
      console.error('Error checking Strava status:', err);
    }
  };

  // Sync Strava activities
  const handleSyncActivities = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/strava/sync');
      const data = await res.json();
      if (data.success) alert('Activities synced!');
    } catch (err) {
      console.error('Error syncing activities:', err);
      alert('Failed to sync activities');
    } finally {
      setIsSyncing(false);
    }
  };

  // Check Strava status when session is available
  useEffect(() => {
    if (session?.user) {
      checkStravaStatus();
    }
  }, [session]);
  */

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

            {/* Strava integration (disabled for now) */}
            {/* 
            {isStravaConnected ? (
              <button
                onClick={handleSyncActivities}
                disabled={isSyncing}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4zm0-8c-1.66 0-3 1.34-3 3h2c0-.55.45-1 1-1s1 .45 1 1h2c0-1.66-1.34-3-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isSyncing ? 'Syncing...' : 'Sync Activities'}
              </button>
            ) : (
              <button
                onClick={() => signIn('strava')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-orange-400 hover:bg-orange-500/10 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h-2c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 0H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Connect Strava
              </button>
            )}
            */}

            {/* <button
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
            </button> */}

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