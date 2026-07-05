import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Intake Tracker',
  description: 'Track your daily water intake with smart reminders. Stay hydrated and optimize your performance with personalized hydration goals.',
};

export default function WaterTrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
