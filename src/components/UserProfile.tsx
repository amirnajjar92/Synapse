'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  email: string;
  name: string;
  picture?: string | null;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('synapse_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      <button
        onClick={handleLogout}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform"
        title="Logout"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          (user.name?.charAt(0) || user.email.charAt(0).toUpperCase())
        )}
      </button>
      <span className="text-white text-sm font-medium truncate max-w-[150px] hidden sm:block">
        {user.name || user.email}
      </span>
    </div>
  );
}
