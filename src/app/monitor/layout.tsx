import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Monitor',
  description: 'Track your cardio sessions, heart rate zones, and overall wellness metrics. Optimize your cardiovascular training and recovery.',
};

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
