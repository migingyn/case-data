import { useSyncExternalStore } from 'react';
import type { z } from 'zod';

/**
 * A value kept in sessionStorage for the life of the tab, readable from React
 * with useSessionValue. Falls back to memory when storage is blocked.
 */
export function createSessionStore<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  let value = fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) value = schema.parse(JSON.parse(raw));
  } catch {
    // Missing, corrupt or blocked storage: start from the fallback.
  }
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set(next: T) {
      value = next;
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage blocked: keep the in-memory copy for this page load.
      }
      listeners.forEach((notify) => notify());
    },
    subscribe(notify: () => void) {
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    },
  };
}

export type SessionStore<T> = ReturnType<typeof createSessionStore<T>>;

export function useSessionValue<T>(store: SessionStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
