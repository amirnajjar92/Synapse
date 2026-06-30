'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/components/SidebarContext';
import PWAUpdater from '@/components/PWAUpdater';
import PWAInstallButton from '@/components/PWAInstallButton';
import PushNotificationManager from '@/components/PushNotificationManager';
import PusherNotificationListener from '@/components/PusherNotificationListener';
import DynamicThemeColor from '@/components/DynamicThemeColor';
import { StoreProvider } from '@/lib/redux/StoreProvider';
import ScreenshotProvider from '@/components/ScreenshotProvider';

function ScreenshotWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ScreenshotProvider>
        {children}
      </ScreenshotProvider>
    </Suspense>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isLanding = mounted && pathname?.startsWith('/landing');

  if (isLanding) {
    return (
      <>
        <DynamicThemeColor />
        <ScreenshotWrapper>
          {children}
        </ScreenshotWrapper>
      </>
    );
  }

  return (
    <>
      <PWAUpdater />
      <PWAInstallButton />
      <PushNotificationManager />
      <PusherNotificationListener />
      <DynamicThemeColor />
      <ScreenshotWrapper>
        <StoreProvider>
          <SidebarProvider>
            <Sidebar />
            {children}
          </SidebarProvider>
        </StoreProvider>
      </ScreenshotWrapper>
    </>
  );
}
