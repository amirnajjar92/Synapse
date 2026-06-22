'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/lib/hooks/useNotifications';

export default function DailyPlanReminderSettings() {
  const { data: session } = useSession();
  const { permission, requestPermission } = useNotifications();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorage.getItem('dailyPlanReminderSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setEnabled(parsed.enabled || false);
      setTime(parsed.time || '08:00');
    }
  }, []);

  const saveSettings = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      const settings = { enabled, time };
      localStorage.setItem('dailyPlanReminderSettings', JSON.stringify(settings));

      // If enabled, create or update a reminder
      if (enabled && permission.granted) {
        // Check if reminder exists
        const response = await fetch(
          `/api/reminders?email=${encodeURIComponent(session.user.email)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const existingReminder = data.reminders?.find(
            (r: any) => r.type === 'CUSTOM' && r.title === 'Daily Plan Review'
          );

          if (existingReminder) {
            // Update existing reminder
            await fetch('/api/reminders', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: existingReminder.id,
                time,
                enabled,
              }),
            });
          } else {
            // Create new reminder
            await fetch('/api/reminders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                title: 'Daily Plan Review',
                message: 'Time to check today\'s tasks and log your progress!',
                time,
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                type: 'CUSTOM',
              }),
            });
          }
        }
      }

      alert('✅ Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">📋 Daily Plan Reminder</h3>
          <p className="text-sm text-gray-600">
            Get notified daily to review and log your plan progress
          </p>
        </div>
        <label className="relative inline-block w-14 h-7">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
            disabled={!permission.granted}
          />
          <span className="absolute inset-0 bg-gray-300 rounded-full peer-checked:bg-green-500 transition cursor-pointer"></span>
          <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-7"></span>
        </label>
      </div>

      {!permission.granted && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            🔔 Notifications are not enabled
          </p>
          <button
            onClick={requestPermission}
            className="text-sm text-yellow-900 font-semibold underline hover:no-underline"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {enabled && (
        <div>
          <label className="block text-sm font-semibold mb-2">
            Notification Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            You'll receive a notification at this time every day
          </p>
        </div>
      )}

      <button
        onClick={saveSettings}
        disabled={loading || !permission.granted}
        className={`w-full p-3 rounded-lg font-semibold transition ${
          loading || !permission.granted
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
        }`}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      {enabled && permission.granted && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Your daily plan notification will include today's tasks from your active plan
            and link to the monitor page for easy logging.
          </p>
        </div>
      )}
    </div>
  );
}
