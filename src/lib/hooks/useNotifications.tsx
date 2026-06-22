'use client';

import { useEffect, useState } from 'react';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true);
      
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission({
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default',
      });
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || !permission.granted) {
      console.log('Cannot send notification - permission not granted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  };

  const scheduleNotification = async (
    title: string,
    time: string, // HH:mm format
    options?: NotificationOptions
  ) => {
    if (!permission.granted) {
      console.log('Permission not granted for scheduled notifications');
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification(title, options);
    }, delay);
  };

  return {
    supported,
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
  };
};
