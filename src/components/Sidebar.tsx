'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import { useSession, signIn } from 'next-auth/react';
import { themes, loadTheme, saveTheme } from '@/lib/theme';
import NotificationToggle from './NotificationToggle';
import InvitationBell from './InvitationBell';

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
  tables?: { title: string; rows: { columns: string[] }[] }[];
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
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
              <div className="flex-1 min-w-0 text-left">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <circle cx="8" cy="14" r="1" />
                <circle cx="12" cy="14" r="1" />
                <circle cx="16" cy="14" r="1" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Planner</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Create your training plan</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/my-plans');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
                <path d="M9 3v3h6V3" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">My Plans</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Browse saved plans</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/water-tracker');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Water Tracker</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Track daily hydration</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                const active = activePlans[0];
                router.push(active ? `/monitor?planId=${active.id}` : '/monitor');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <img
                src="/vectors/cardio-icon.svg"
                alt=""
                className="w-5 h-5 brightness-0 invert group-hover:invert-0 transition-all duration-200"
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <p className="font-medium leading-tight">Cardio Monitor</p>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B63CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Log cardio performance</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/workout-planner');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <img
                src="/vectors/workout-icon.svg"
                alt=""
                className="w-5 h-5 brightness-0 invert group-hover:invert-0 transition-all duration-200"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Workout Planner</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Build gym sessions</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/workout-tracker');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4.5" r="2" />
                <path d="M12 6.5v5l-3 3M12 11.5l3 3" />
                <path d="M8 9l-2 1 1 3M16 9l2 1-1 3" />
                <path d="M12 16.5v4M10 20.5h4" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Workout Tracker</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Follow daily exercises</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/training-studio');
              }}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Training Studio</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Manage clients & build plans</p>
              </div>
            </button>

            {/* Invitation Bell - Show for all logged-in users */}
            {user?.email && (
              <InvitationBell userEmail={user.email} />
            )}

            {/* Admin Panel - Only show for admins */}
            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/admin');
                }}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-black hover:bg-white transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium leading-tight">Admin Panel</p>
                  <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Manage users and roles</p>
                </div>
              </button>
            )}

            {/* Active Plans Section */}
            {activePlans.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="px-4 mb-2">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B63CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="12" y1="2" x2="12" y2="4" />
                      <line x1="12" y1="20" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="4" y2="12" />
                      <line x1="20" y1="12" x2="22" y2="12" />
                    </svg>
                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                      Active Plans
                    </p>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Quick access to your in-progress plans</p>
                </div>
                {activePlans.map((plan) => {
                  const isWorkoutPlan = plan.tables?.some(t => t.title === 'WORKOUT PLAN');
                  const subtitle = isWorkoutPlan ? 'Open workout day view' : 'View progress dashboard';
                  return (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (isWorkoutPlan) {
                        router.push(`/workout-tracker?planId=${plan.id}`);
                      } else {
                        router.push(`/plan-progress-tracker?planId=${plan.id}`);
                      }
                    }}
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-white/80 hover:text-black hover:bg-white transition-all duration-200 w-full"
                  >
                    {isWorkoutPlan ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <path d="M6 9h12" />
                        <path d="M4 12h16" />
                        <path d="M6 15h12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-sm font-medium leading-tight">{plan.title}</p>
                      <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">{subtitle}</p>
                    </div>
                  </button>
                );})}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium leading-tight">Logout</p>
                <p className="text-[10px] text-white/45 group-hover:text-black/60 leading-tight mt-0.5">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
