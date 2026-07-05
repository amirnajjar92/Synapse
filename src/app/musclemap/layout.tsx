import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Muscle Anatomy Map',
  description: 'Explore an interactive 3D muscle anatomy map. Learn about muscle groups, their functions, and the best exercises to target each one.',
};

export default function MuscleMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
