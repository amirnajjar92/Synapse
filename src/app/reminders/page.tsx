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
        <nav className="flex justify-center gap-6 pt-6" style={{ opacity: 0.4 }}>
          <a href="/" className="text-gray-600 text-sm hover:text-gray-900">Home</a>
          <a href="/planner" className="text-gray-600 text-sm hover:text-gray-900">Workout Planner</a>
          <a href="/workout-tracker" className="text-gray-600 text-sm hover:text-gray-900">Workout Tracker</a>
          <a href="/blog" className="text-gray-600 text-sm hover:text-gray-900">Fitness Blog</a>
        </nav>
      </div>
    </div>
  );
}
