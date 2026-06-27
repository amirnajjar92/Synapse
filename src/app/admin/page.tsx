'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: {
    userPrompts: number;
    plans: number;
  };
}

interface UserPrompt {
  id: string;
  prompt: string;
  createdAt: string;
  plan: {
    id: string;
    title: string;
  } | null;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] opacity-50 ${className}`} />
);

const Spinner = ({ size = 24 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/10 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.email) {
        router.push('/planner');
        return;
      }

      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.set('email', user.email);

      const response = await fetch(url.toString());
      
      if (response.status === 403) {
        router.push('/planner');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Authorization error:', error);
      router.push('/planner');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPrompts = async (userId: string) => {
    setLoadingPrompts(true);
    try {
      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.email) return;

      const url = new URL(`/api/admin/users/${userId}/prompts`, window.location.origin);
      url.searchParams.set('email', user.email);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setUserPrompts(data.prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserPrompts(user.id);
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setChangingRole(userId);
    try {
      const userStr = localStorage.getItem('synapse_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.email) return;

      const url = new URL(`/api/admin/users/${userId}`, window.location.origin);
      url.searchParams.set('email', user.email);

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setChangingRole(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#0b0b0b] flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BurgerMenuButton />
            <h1 className="text-xl sm:text-2xl tracking-wider" style={{ fontFamily: 'var(--font-hanalei-fill)' }}>
              ADMIN PANEL
            </h1>
          </div>
          <button
            onClick={() => router.push('/planner')}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10"
            style={{ color: '#a3a3a3' }}
          >
            Back to App
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Users List */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-medium" style={{ color: '#a3a3a3' }}>USERS</h2>
            </div>
            <div className="p-3 space-y-1 max-h-[600px] overflow-y-auto scrollbar-thin">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">{user.name || 'Unknown'}</span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${
                            user.role === 'ADMIN'
                              ? 'bg-white/10 text-white/70'
                              : 'bg-white/[0.04] text-white/40'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{user._count.plans} plans</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{user._count.userPrompts} prompts</span>
                      </div>
                    </div>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN');
                      }}
                      disabled={changingRole === user.id}
                      className="flex-shrink-0 px-2 py-1 text-xs rounded-md transition-colors focus:outline-none disabled:opacity-40"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#a3a3a3',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Prompts */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
                {selectedUser ? `${selectedUser.name || 'User'}'s Prompts` : 'PROMPTS'}
              </h2>
            </div>
            
            {!selectedUser ? (
              <div className="flex items-center justify-center h-[400px]">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Select a user to view their prompts</span>
              </div>
            ) : loadingPrompts ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : userPrompts.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No prompts found</span>
              </div>
            ) : (
              <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                {userPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(prompt.createdAt).toLocaleString()}
                      </span>
                      {prompt.plan && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                        >
                          {prompt.plan.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {prompt.prompt}
                    </p>
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
