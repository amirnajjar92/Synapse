interface Reminder {
  id: string;
  title: string;
  message?: string;
  time: string;
  days: string[];
  enabled: boolean;
  type: string;
}

class ReminderManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private reminders: Reminder[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkPermission();
    }
  }

  private checkPermission(): boolean {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    return Notification.permission === 'granted';
  }

  private getDayOfWeek(date: Date): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[date.getDay()];
  }

  private getNextOccurrence(time: string, days: string[]): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const currentDay = this.getDayOfWeek(now);

    // Try today first
    const todayTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    if (days.includes(currentDay) && todayTime > now) {
      return todayTime;
    }

    // Find next occurrence
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + i);
      nextDate.setHours(hours, minutes, 0, 0);

      const nextDay = this.getDayOfWeek(nextDate);
      if (days.includes(nextDay)) {
        return nextDate;
      }
    }

    // Fallback to tomorrow at the same time
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  }

  private scheduleReminder(reminder: Reminder) {
    if (!reminder.enabled) return;

    const nextOccurrence = this.getNextOccurrence(reminder.time, reminder.days);
    const delay = nextOccurrence.getTime() - Date.now();

    if (delay < 0) return;

    const timer = setTimeout(() => {
      this.sendNotification(reminder);
      // Reschedule for next occurrence
      this.scheduleReminder(reminder);
    }, delay);

    this.timers.set(reminder.id, timer);
  }

  private sendNotification(reminder: Reminder) {
    if (!this.checkPermission()) return;

    const typeIcons: Record<string, string> = {
      WATER: '💧',
      WORKOUT: '💪',
      MEAL: '🍽️',
      CUSTOM: '⏰',
    };

    const icon = typeIcons[reminder.type] || '⏰';
    const title = `${icon} ${reminder.title}`;

    const notification = new Notification(title, {
      body: reminder.message || 'Time for your reminder!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: reminder.id,
      requireInteraction: false,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }

  public loadReminders(reminders: Reminder[]) {
    // Clear existing timers
    this.clearAllTimers();

    // Store reminders
    this.reminders = reminders;

    // Schedule enabled reminders
    reminders.filter((r) => r.enabled).forEach((reminder) => {
      this.scheduleReminder(reminder);
    });
  }

  public addReminder(reminder: Reminder) {
    this.reminders.push(reminder);
    if (reminder.enabled) {
      this.scheduleReminder(reminder);
    }
  }

  public updateReminder(id: string, updates: Partial<Reminder>) {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.reminders[index] = { ...this.reminders[index], ...updates };

      // Clear old timer
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }

      // Reschedule if enabled
      if (this.reminders[index].enabled) {
        this.scheduleReminder(this.reminders[index]);
      }
    }
  }

  public removeReminder(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.reminders = this.reminders.filter((r) => r.id !== id);
  }

  private clearAllTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  public destroy() {
    this.clearAllTimers();
    this.reminders = [];
  }
}

// Singleton instance
let reminderManagerInstance: ReminderManager | null = null;

export const getReminderManager = (): ReminderManager => {
  if (typeof window === 'undefined') {
    throw new Error('ReminderManager can only be used in the browser');
  }

  if (!reminderManagerInstance) {
    reminderManagerInstance = new ReminderManager();
  }

  return reminderManagerInstance;
};

export default ReminderManager;
