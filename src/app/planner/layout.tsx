import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: 'Describe your fitness goals and get a personalized AI-generated training plan tailored to your equipment, schedule, and experience level.',
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
