'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface Reminder {
  id?: string;
  title: string;
  message?: string;
  time: string;
  days: string[];
  enabled: boolean;
  type: 'WATER' | 'WORKOUT' | 'MEAL' | 'CUSTOM';
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const REMINDER_TYPES = [
  { value: 'WATER', label: '💧 Water', icon: '💧' },
  { value: 'WORKOUT', label: '💪 Workout', icon: '💪' },
  { value: 'MEAL', label: '🍽️ Meal', icon: '🍽️' },
  { value: 'CUSTOM', label: '⏰ Custom', icon: '⏰' },
];

export default function ReminderSettings() {
  const { data: session } = useSession();
  const { permission, requestPermission, supported } = useNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState<Reminder>({
    title: '',
    message: '',
    time: '09:00',
    days: [],
    enabled: true,
    type: 'CUSTOM',
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchReminders();
    }
  }, [session]);

  const fetchReminders = async () => {
    try {
      const response = await fetch(
        `/api/reminders?email=${encodeURIComponent(session?.user?.email || '')}`
      );
      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('✅ Notifications enabled!');
    } else {
      alert('❌ Notification permission denied. Please enable in browser settings.');
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || newReminder.days.length === 0) {
      alert('Please fill in title and select at least one day');
      return;
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          ...newReminder,
        }),
      });

      if (response.ok) {
        await fetchReminders();
        setShowAddForm(false);
        setNewReminder({
          title: '',
          message: '',
          time: '09:00',
          days: [],
          enabled: true,
          type: 'CUSTOM',
        });
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder');
    }
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });

      if (response.ok) {
        setReminders(
          reminders.map((r) => (r.id === id ? { ...r, enabled } : r))
        );
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReminders(reminders.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const toggleDay = (day: string) => {
    setNewReminder((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  if (!supported) {
    return (
      <div className="p-6 bg-red-50 rounded-xl">
        <p className="text-red-600">
          ❌ Notifications are not supported in this browser
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">⏰ Reminders</h2>
        {!permission.granted && (
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            🔔 Enable Notifications
          </button>
        )}
      </div>

      {/* Permission Status */}
      {permission.granted && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700">✅ Notifications are enabled</p>
        </div>
      )}

      {permission.denied && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700">
            ❌ Notifications are blocked. Please enable them in your browser
            settings.
          </p>
        </div>
      )}

      {/* Add Reminder Button */}
      {permission.granted && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition text-gray-600 hover:text-purple-600 font-semibold"
        >
          + Add New Reminder
        </button>
      )}

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
          <h3 className="text-xl font-bold">Create New Reminder</h3>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {REMINDER_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setNewReminder({ ...newReminder, type: type.value as any })
                  }
                  className={`p-3 rounded-lg border-2 transition ${
                    newReminder.type === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl">{type.icon}</div>
                  <div className="text-xs mt-1">{type.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder({ ...newReminder, title: e.target.value })
              }
              placeholder="E.g., Drink water"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Message (optional)
            </label>
            <input
              type="text"
              value={newReminder.message}
              onChange={(e) =>
                setNewReminder({ ...newReminder, message: e.target.value })
              }
              placeholder="E.g., Time to hydrate!"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">Time</label>
            <input
              type="time"
              value={newReminder.time}
              onChange={(e) =>
                setNewReminder({ ...newReminder, time: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Repeat on
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    newReminder.days.includes(day)
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {day.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddReminder}
              className="flex-1 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Create Reminder
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 && !showAddForm && (
          <div className="text-center p-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No reminders yet. Add one to get started!</p>
          </div>
        )}

        {reminders.map((reminder) => {
          const typeInfo = REMINDER_TYPES.find((t) => t.value === reminder.type);
          return (
            <div
              key={reminder.id}
              className={`p-4 rounded-xl border-2 transition ${
                reminder.enabled
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{typeInfo?.icon}</span>
                    <h3 className="font-bold text-lg">{reminder.title}</h3>
                  </div>
                  {reminder.message && (
                    <p className="text-gray-600 text-sm mb-2">
                      {reminder.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-semibold">🕐 {reminder.time}</span>
                    <span>•</span>
                    <span>
                      {reminder.days
                        .map((d) => d.slice(0, 3).toUpperCase())
                        .join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={(e) =>
                        handleToggleReminder(reminder.id!, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 bg-gray-300 rounded-full peer-checked:bg-green-500 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                  </label>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id!)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
