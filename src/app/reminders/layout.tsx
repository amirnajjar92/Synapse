import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reminders',
  description: 'Stay on track with personalized fitness and health reminders. Enhance your wellness journey with Synapse Fit today!',
};

export default function RemindersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
