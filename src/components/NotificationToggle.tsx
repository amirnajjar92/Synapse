'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificationToggle() {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // Check current notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const saved = localStorage.getItem('notificationsEnabled');
      setEnabled(saved === 'true' && Notification.permission === 'granted');
    }
  }, []);

  const sendTestNotification = async () => {
    console.log('📨 sendTestNotification called');
    console.log('👤 Session:', session);
    console.log('📧 User email:', session?.user?.email);
    
    // Try to get email from session or localStorage
    let userEmail = session?.user?.email;
    
    if (!userEmail) {
      console.log('⚠️ No session email, checking localStorage...');
      const userStr = localStorage.getItem('synapse_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userEmail = user.email;
        console.log('✅ Found email in localStorage:', userEmail);
      }
    }
    
    if (!userEmail) {
      console.log('❌ No email found anywhere, aborting');
      
      // Send a simple test notification anyway
      console.log('📨 Sending simple test notification instead');
      const notification = new Notification('🎯 Synapse Fit - Notifications Active!', {
        body: 'Your notifications are working! Log in to see your daily focus tasks.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
      });
      
      notification.onclick = () => {
        console.log('🖱️ Notification clicked');
        window.focus();
        notification.close();
      };
      
      return;
    }

    try {
      console.log('🔍 Fetching user plans for:', userEmail);
      
      // Fetch user's active plan
      const response = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Plans data:', data);
        
        const activePlan = data.plans?.find((p: any) => p.status === 'IN_PROGRESS');
        console.log('🎯 Active plan:', activePlan);

        if (activePlan) {
          console.log('📅 Found active plan:', activePlan.title);
          
          // Get today's tasks
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          console.log('📆 Today is:', today);
          
          let todayTasks: string[] = [];

          activePlan.tables?.forEach((table: any) => {
            console.log('📋 Checking table:', table.title);
            
            table.rows?.forEach((row: any) => {
              const firstCol = row.columns[0];
              console.log('  - Row first column:', firstCol);
              
              if (firstCol && firstCol.toLowerCase().includes(today.toLowerCase())) {
                const task = row.columns.slice(1).join(' - ');
                if (task) {
                  console.log('  ✅ Found task for today:', task);
                  todayTasks.push(`${table.title}: ${task}`);
                }
              }
            });
          });

          console.log('📝 Total tasks found for today:', todayTasks.length);
          console.log('📝 Tasks:', todayTasks);

          const taskText = todayTasks.length > 0
            ? todayTasks.slice(0, 3).join('\n')
            : 'Check your plan for today!';

          console.log('📨 Creating notification with text:', taskText);

          const notification = new Notification('📋 Today\'s Focus with Synapse', {
            body: taskText,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'daily-focus',
          });

          console.log('✅ Notification created successfully!');

          notification.onclick = () => {
            console.log('🖱️ Notification clicked');
            window.focus();
            notification.close();
          };
        } else {
          console.log('⚠️ No active plan found, sending welcome notification');
          
          // No active plan - send welcome notification
          const notification = new Notification('🎯 Synapse Fit', {
            body: 'Notifications are now active! Create a plan to get daily focus reminders.',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          });

          console.log('✅ Welcome notification sent!');

          notification.onclick = () => {
            console.log('🖱️ Notification clicked');
            window.focus();
            notification.close();
          };
        }
      } else {
        console.log('❌ API request failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  };

  const handleToggle = async () => {
    console.log('🔔 Toggle clicked, current state:', enabled);
    
    if (!enabled) {
      console.log('🔔 Requesting notification permission...');
      
      // Request permission
      const result = await Notification.requestPermission();
      console.log('🔔 Permission result:', result);
      setPermission(result);

      if (result === 'granted') {
        console.log('✅ Permission granted! Enabling notifications...');
        setEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        console.log('💾 Saved to localStorage');
        
        // Send immediate test notification
        console.log('📨 Sending test notification in 500ms...');
        setTimeout(() => {
          console.log('📨 Calling sendTestNotification()');
          sendTestNotification();
        }, 500);
      } else {
        console.log('❌ Permission denied or dismissed');
      }
    } else {
      // Disable
      console.log('🔕 Disabling notifications');
      setEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      console.log('💾 Disabled state saved to localStorage');
    }
  };

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white/80 font-medium text-sm">Notifications</span>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-block w-11 h-6">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <span className="absolute inset-0 bg-white/20 rounded-full peer-checked:bg-white transition cursor-pointer"></span>
          <span className="absolute left-1 top-1 w-4 h-4 bg-black rounded-full transition peer-checked:translate-x-5 peer-checked:bg-black"></span>
        </label>
      </div>

      {permission === 'denied' && (
        <p className="text-xs text-red-400 mt-2 ml-13">
          Notifications blocked. Enable in browser settings.
        </p>
      )}
    </div>
  );
}
