import ReminderSettings from '@/components/ReminderSettings';
import ReminderInitializer from '@/components/ReminderInitializer';
import DailyPlanReminderSettings from '@/components/DailyPlanReminderSettings';

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      <ReminderInitializer />
      <div className="pt-6 max-w-4xl mx-auto space-y-6 px-4">
        {/* Daily Plan Reminder Section */}
        <DailyPlanReminderSettings />
        
        {/* General Reminders Section */}
        <ReminderSettings />

        {/* Internal links for SEO */}
        <nav className="sr-only" aria-label="Internal navigation">
          <a href="/">Home</a>
          <a href="/planner">Workout Planner</a>
          <a href="/workout-tracker">Workout Tracker</a>
          <a href="/blog">Fitness Blog</a>
        </nav>
      </div>
    </div>
  );
}
