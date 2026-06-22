'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from './useNotifications';

interface PlanTable {
  id: string;
  title: string;
  rows: {
    columns: string[];
  }[];
}

interface Plan {
  id: string;
  title: string;
  status: string;
  tables: PlanTable[];
}

export const useDailyPlanNotifications = () => {
  const { data: session } = useSession();
  const { permission, sendNotification } = useNotifications();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notificationsSent, setNotificationsSent] = useState(false);

  // Fetch active plan
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/users/me/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user!.email }),
        });

        if (response.ok) {
          const data = await response.json();
          const activePlan = data.plans?.find(
            (p: Plan) => p.status === 'IN_PROGRESS'
          );
          setPlan(activePlan || null);
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      }
    };

    fetchPlan();
  }, [session]);

  // Parse today's tasks from plan
  const getTodayTasks = () => {
    if (!plan) return [];

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const tasks: { type: string; task: string }[] = [];

    plan.tables.forEach((table) => {
      const title = table.title.toUpperCase();
      
      // Check if it's a schedule-based table (MEALS, CARDIO, WEIGHTS, etc.)
      table.rows.forEach((row) => {
        if (row.columns.length > 0) {
          const firstColumn = row.columns[0];
          
          // Check if first column matches today's day
          if (firstColumn.toLowerCase().includes(dayName.toLowerCase())) {
            tasks.push({
              type: title,
              task: row.columns.slice(1).join(' - '),
            });
          }
          // Or if it's a time-based task (e.g., "08:00 Breakfast")
          else if (/^\d{1,2}:\d{2}/.test(firstColumn)) {
            tasks.push({
              type: title,
              task: row.columns.join(' - '),
            });
          }
        }
      });
    });

    return tasks;
  };

  // Send notification about today's plan
  const sendDailyPlanNotification = () => {
    if (!permission.granted || !plan || notificationsSent) return;

    const tasks = getTodayTasks();
    
    if (tasks.length === 0) {
      // Send a general reminder
      const notification = sendNotification(
        `📋 ${plan.title}`,
        {
          body: 'Check your plan for today\'s activities!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'daily-plan',
          requireInteraction: false,
        }
      );

      if (notification) {
        notification.onclick = () => {
          window.open('/monitor', '_blank');
          notification.close();
        };
      }
    } else {
      // Send notification with specific tasks
      const taskSummary = tasks
        .slice(0, 3)
        .map((t) => `${t.type}: ${t.task}`)
        .join('\n');
      
      const moreText = tasks.length > 3 ? `\n+${tasks.length - 3} more...` : '';

      const notification = sendNotification(
        `📋 Today's Plan: ${plan.title}`,
        {
          body: `${taskSummary}${moreText}\n\nTap to log your progress!`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'daily-plan',
          requireInteraction: true,
        }
      );

      if (notification) {
        notification.onclick = () => {
          window.open('/monitor', '_blank');
          notification.close();
        };
      }
    }

    setNotificationsSent(true);
    
    // Save to localStorage to prevent duplicate notifications today
    const today = new Date().toDateString();
    localStorage.setItem('lastPlanNotification', today);
  };

  // Check if we should send notification
  useEffect(() => {
    if (!permission.granted || !plan) return;

    // Check if we already sent notification today
    const lastNotification = localStorage.getItem('lastPlanNotification');
    const today = new Date().toDateString();
    
    if (lastNotification === today) {
      setNotificationsSent(true);
      return;
    }

    // Wait a bit after page load to send notification
    const timer = setTimeout(() => {
      sendDailyPlanNotification();
    }, 2000);

    return () => clearTimeout(timer);
  }, [permission, plan]);

  return {
    plan,
    todayTasks: getTodayTasks(),
    sendDailyPlanNotification,
    notificationsSent,
  };
};
