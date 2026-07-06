import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Muscle Anatomy Map',
  description: 'Discover the 3D muscle anatomy map with Synapse Fit. Learn muscle groups, functions, and targeted exercises for optimal fitness.',
};

export default function MuscleMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
