'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getReminderManager } from '@/lib/reminderManager';

export default function ReminderInitializer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    if (status !== 'authenticated') return;
    if (!session?.user?.email) return;

    const initializeReminders = async () => {
      try {
        // Check notification permission
        if ('Notification' in window && Notification.permission === 'granted' && session.user?.email) {
          // Fetch user's reminders
          const response = await fetch(
            `/api/reminders?email=${encodeURIComponent(session.user.email)}`
          );

          if (response.ok) {
            const data = await response.json();
            const reminderManager = getReminderManager();
            reminderManager.loadReminders(data.reminders || []);
            console.log('✅ Reminders initialized:', data.reminders?.length || 0);
          }
        }
      } catch (error) {
        console.error('Error initializing reminders:', error);
      }
    };

    initializeReminders();

    // Cleanup on unmount
    return () => {
      try {
        if (typeof window !== 'undefined') {
          const reminderManager = getReminderManager();
          reminderManager.destroy();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    };
  }, [session, status]);

  return null; // This component doesn't render anything
}
