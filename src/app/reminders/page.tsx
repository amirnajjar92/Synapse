import { Metadata } from 'next';
import ReminderSettings from '@/components/ReminderSettings';
import ReminderInitializer from '@/components/ReminderInitializer';
import DailyPlanReminderSettings from '@/components/DailyPlanReminderSettings';

export const metadata: Metadata = {
  title: 'Reminders | Synapse Fit',
  description: 'Manage your fitness and health reminders',
};

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      <ReminderInitializer />
      <div className="pt-6 max-w-4xl mx-auto space-y-6 px-4">
        {/* Daily Plan Reminder Section */}
        <DailyPlanReminderSettings />
        
        {/* General Reminders Section */}
        <ReminderSettings />
      </div>
    </div>
  );
}
