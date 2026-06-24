'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useSession, signIn } from 'next-auth/react';
import { themes, loadTheme, saveTheme } from '@/lib/theme';
import NotificationToggle from './NotificationToggle';

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
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isAdmin, setIsAdmin] = useState(false);
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

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user?.email) return;

    try {
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.set('email', user.email);
      const response = await fetch(url.toString());
      
      // If user can access admin endpoint, they are admin
      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  // Check for user data on mount and periodically
  useEffect(() => {
    setMounted(true);
    setCurrentTheme(loadTheme());
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

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    saveTheme(themeId);
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: themeId }));
  };

  // Fetch plans when user is available
  useEffect(() => {
    fetchPlans();
    checkAdminStatus();
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
        className={`fixed left-0 top-0 h-full w-72 bg-black z-[50] shadow-2xl transition-transform duration-300 ease-in-out  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Close Button + Profile Section at Top */}
          <div className="mb-6 pb-6 border-b border-white/20">
            <button
              onClick={() => setIsOpen(false)}
              className="mb-6 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/80 transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-white border-2 border-black flex items-center justify-center text-black font-bold text-xl">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  (user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate text-base">
                  {user?.name || user?.email || 'User'}
                </p>
                <p className="text-white/60 text-xs truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/planner');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Planner</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/my-plans');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">My Plans</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/water-tracker');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Water Tracker</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                const active = activePlans[0];
                router.push(active ? `/monitor?planId=${active.id}` : '/monitor');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Monitor</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/musclemap');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Muscle Map</span>
            </button>

            {/* Admin Panel - Only show for admins */}
            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/admin');
                }}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-medium">Admin Panel</span>
              </button>
            )}

            {/* Active Plans Section */}
            {activePlans.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="px-4 mb-2">
                  <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                    Active Plans
                  </p>
                </div>
                {activePlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/plan-progress-tracker?planId=${plan.id}`);
                    }}
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-white/80 hover:text-black hover:bg-white transition-all duration-200 w-full"
                  >
                    <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{plan.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Theme Switcher */}
            <div className="mt-6 pt-6 border-t border-white/20">
              {/* Notification Toggle */}
              <NotificationToggle />

              <button
                onClick={() => {
                  const currentIndex = themes.findIndex(t => t.id === currentTheme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  handleThemeChange(themes[nextIndex].id);
                }}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200 w-full"
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 border-2 border-white transition-all duration-200"
                  style={{ backgroundColor: themes.find(t => t.id === currentTheme)?.colors.primary }}
                />
                <div className="flex-1 text-left">
                  <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Theme</p>
                  <p className="text-sm font-semibold mt-0.5">{themes.find(t => t.id === currentTheme)?.name}</p>
                </div>
                <svg className="w-5 h-5 text-white/50 group-hover:text-black transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Logout at Bottom */}
          <div className="pt-4 border-t border-white/20 mt-4">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200 w-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}