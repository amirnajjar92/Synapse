'use client';

import { useDailyPlanNotifications } from '@/lib/hooks/useDailyPlanNotifications';

export default function DailyPlanNotifier() {
  // This component only handles the side effect of sending notifications
  // It doesn't render anything visible
  useDailyPlanNotifications();
  
  return null;
}
