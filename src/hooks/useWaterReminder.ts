import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';

const LAST_TRIGGERED_KEY = 'water-reminder-last-triggered';

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function useWaterReminder(onTrigger: () => void) {
  const { reminderConfig } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef<boolean>(false);

  const checkAndTrigger = useCallback(() => {
    if (!reminderConfig.enabled) return;

    const todayStr = getTodayDateString();
    const lastTriggered = localStorage.getItem(LAST_TRIGGERED_KEY);

    if (lastTriggered === todayStr) {
      triggeredRef.current = true;
      return;
    }

    const { hours, minutes } = parseTime(reminderConfig.time);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = hours * 60 + minutes;

    if (currentMinutes >= targetMinutes && !triggeredRef.current) {
      triggeredRef.current = true;
      localStorage.setItem(LAST_TRIGGERED_KEY, todayStr);
      onTrigger();
    }
  }, [reminderConfig, onTrigger]);

  const scheduleNextCheck = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!reminderConfig.enabled) return;

    const { hours, minutes } = parseTime(reminderConfig.time);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    timerRef.current = setTimeout(() => {
      checkAndTrigger();
      scheduleNextCheck();
    }, Math.min(delay, 60000));
  }, [reminderConfig, checkAndTrigger]);

  useEffect(() => {
    const todayStr = getTodayDateString();
    const lastTriggered = localStorage.getItem(LAST_TRIGGERED_KEY);
    triggeredRef.current = lastTriggered === todayStr;

    if (reminderConfig.enabled) {
      checkAndTrigger();
      scheduleNextCheck();
    }

    const intervalId = setInterval(() => {
      const newTodayStr = getTodayDateString();
      const stored = localStorage.getItem(LAST_TRIGGERED_KEY);
      if (stored !== newTodayStr) {
        triggeredRef.current = false;
      }
      if (reminderConfig.enabled) {
        checkAndTrigger();
      }
    }, 30000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      clearInterval(intervalId);
    };
  }, [reminderConfig.enabled, reminderConfig.time, checkAndTrigger, scheduleNextCheck]);
}
