import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness Entertainment',
  description: 'Discover fitness news, workout videos, exercise playlists, and local events. Stay motivated with fresh fitness content curated for you.',
};

export default function EntertainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
