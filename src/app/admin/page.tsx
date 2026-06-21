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

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [changingRole, setChangingRole] = useState(false);

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

      // Fetch users (this will also check if current user is admin)
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
      console.log('[Admin] Received prompts:', data.prompts?.length, 'prompts for userId:', userId);
      setUserPrompts(data.prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleUserSelect = (user: User) => {
    console.log('[Admin] Selected user:', user.email, 'userId:', user.id);
    setSelectedUser(user);
    fetchUserPrompts(user.id);
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setChangingRole(true);
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

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    } finally {
      setChangingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#151515] flex items-center justify-center">
        <Skeleton className="w-40 h-10 rounded" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] text-white p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BurgerMenuButton />
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-hanalei-fill)' }}>
              ADMIN PANEL
            </h1>
          </div>
          <button
            onClick={() => router.push('/planner')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to App
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#3B3B3B]">
            <h2 className="text-2xl font-bold mb-4">Users ({users.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'bg-[#3B63CF] border-[#3B63CF]'
                      : 'bg-[#2a2a2a] border-[#3B3B3B] hover:border-[#3B63CF]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{user.name || 'Unknown'}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{user._count.plans} plans</span>
                        <span>{user._count.userPrompts} prompts</span>
                      </div>
                    </div>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN');
                      }}
                      disabled={changingRole}
                      className="ml-2 px-3 py-1 bg-[#0b0b0b] border border-[#3B3B3B] rounded text-sm hover:border-[#3B63CF] focus:outline-none focus:border-[#3B63CF] disabled:opacity-50"
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
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#3B3B3B]">
            <h2 className="text-2xl font-bold mb-4">
              {selectedUser ? `${selectedUser.name || 'User'}'s Prompts` : 'Select a User'}
            </h2>
            
            {!selectedUser ? (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                Select a user to view their prompts
              </div>
            ) : loadingPrompts ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : userPrompts.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                No prompts found for this user
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {userPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-4 bg-[#2a2a2a] rounded-lg border border-[#3B3B3B]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(prompt.createdAt).toLocaleString()}
                      </span>
                      {prompt.plan && (
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                          {prompt.plan.title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
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
