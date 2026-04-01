'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `callback` on an interval (default 30s).
 * Automatically pauses when the tab is hidden and resumes when visible.
 */
export function useAutoRefresh(callback: () => void, intervalMs = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    function start() {
      timer = setInterval(() => savedCallback.current(), intervalMs);
    }

    function handleVisibility() {
      clearInterval(timer);
      if (!document.hidden) start();
    }

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}
