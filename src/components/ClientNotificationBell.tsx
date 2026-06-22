'use client';

import dynamic from 'next/dynamic';

const NotificationBellButton = dynamic(
  () => import('./NotificationBellButton'),
  { ssr: false }
);

export default function ClientNotificationBell() {
  return <NotificationBellButton />;
}
