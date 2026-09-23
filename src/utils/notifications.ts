import { playTimerAlert, triggerHaptic } from './audioAlerts';
import { SoundAlert } from '../types';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function sendTimerCompleteNotification(
  sessionTitle: string,
  durationText: string,
  soundAlert: SoundAlert,
  soundVolume: number,
  vibrate: boolean
) {
  // 1. Play synthesized tone
  playTimerAlert(soundAlert, soundVolume);

  // 2. Trigger vibration on mobile
  triggerHaptic(vibrate);

  // 3. Local Web Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const options: NotificationOptions & { renotify?: boolean } = {
        body: `"${sessionTitle}" (${durationText}) finished. Time to take a break or transition!`,
        icon: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=192&q=80',
        tag: 'chronos-timer-alert',
        renotify: true,
        requireInteraction: true,
        silent: false,
      };
      const notification = new Notification('Timer Complete! ⏱️', options as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.warn('Local notification dispatch error:', err);
    }
  }
}

// Live screen reader announcer
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const containerId = priority === 'assertive' ? 'sr-announcer-assertive' : 'sr-announcer-polite';
  const el = document.getElementById(containerId);
  if (el) {
    el.textContent = '';
    // Tiny timeout so screen reader registers text change
    setTimeout(() => {
      el.textContent = message;
    }, 50);
  }
}
