import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reminders',
  description: 'Set and manage fitness reminders for workouts, water intake, meals, and more. Stay on track with smart notifications.',
};

export default function RemindersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
