import { type RefObject, useEffect, useState } from "react";

const WATCH_INTERVAL_MINUTES = 180;
const WATCH_INTERVAL_MS = WATCH_INTERVAL_MINUTES * 60 * 1000;
const MAX_REMINDERS = 2;
const NOTICE_MS = 8000;
const WATCH_TIME_KEY = "anivfx-daily-watch-time";

interface DailyWatchTime {
  day: string;
  watchedMs: number;
}

function localDay() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function readWatchTime(day: string, fallback: number) {
  try {
    const raw = localStorage.getItem(WATCH_TIME_KEY);
    if (!raw) return fallback;
    const record: DailyWatchTime = JSON.parse(raw);
    if (record.day === day && Number.isFinite(record.watchedMs)) {
      return Math.max(0, record.watchedMs);
    }
  } catch {}
  return fallback;
}

function saveWatchTime(record: DailyWatchTime) {
  try {
    localStorage.setItem(WATCH_TIME_KEY, JSON.stringify(record));
  } catch {}
}

export function useWatchReminder(videoRef: RefObject<HTMLVideoElement | null>) {
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);

  useEffect(() => {
    let day = localDay();
    let watchedMs = readWatchTime(day, 0);
    let previousTick = performance.now();
    let previousVideo: HTMLVideoElement | null = null;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(now - previousTick, 1000);
      previousTick = now;
      const video = videoRef.current;
      const watching =
        video &&
        !document.hidden &&
        !video.paused &&
        !video.ended &&
        !video.seeking &&
        video.readyState >= 3;
      const sameVideo = watching && video === previousVideo;
      previousVideo = watching ? video : null;
      if (!sameVideo) return;

      const today = localDay();
      if (today !== day) {
        day = today;
        watchedMs = 0;
      }
      // Read the latest count so another visible tab cannot overwrite it with an old value.
      watchedMs = readWatchTime(day, watchedMs);
      const previousReminders = Math.floor(watchedMs / WATCH_INTERVAL_MS);
      if (previousReminders >= MAX_REMINDERS) return;

      watchedMs += elapsed;
      saveWatchTime({ day, watchedMs });
      const reminders = Math.floor(watchedMs / WATCH_INTERVAL_MS);
      if (reminders > previousReminders)
        setReminderMinutes(reminders * WATCH_INTERVAL_MINUTES);
    }, 1000);

    return () => clearInterval(interval);
  }, [videoRef]);

  useEffect(() => {
    if (reminderMinutes === null) return;
    const timer = setTimeout(() => setReminderMinutes(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [reminderMinutes]);

  return reminderMinutes;
}
