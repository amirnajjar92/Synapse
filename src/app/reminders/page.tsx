import { Metadata } from 'next';
import ReminderSettings from '@/components/ReminderSettings';
import ReminderInitializer from '@/components/ReminderInitializer';

export const metadata: Metadata = {
  title: 'Reminders | Synapse Fit',
  description: 'Manage your fitness and health reminders',
};

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      <ReminderInitializer />
      <div className="pt-6">
        <ReminderSettings />
      </div>
    </div>
  );
}
