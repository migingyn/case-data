import { useQuery } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { z } from 'zod';
import { getMatterDashboard } from '@/api/matters';
import type { MatterDashboard } from '@/types/matters';

// Sample data isn't per-user yet. Once matters come from Supabase, add the
// user id to these keys and gate the query on `enabled: !!user`.
export const matterKeys = {
  all: ['matters'] as const,
  dashboard: () => [...matterKeys.all, 'dashboard'] as const,
};

const dashboardQuery = {
  queryKey: matterKeys.dashboard(),
  queryFn: getMatterDashboard,
  // Poll so newly arrived activity shows up without a reload.
  refetchInterval: 30_000,
};

export function useMatterDashboard() {
  return useQuery(dashboardQuery);
}

export function useMatter(id: string) {
  return useQuery({
    ...dashboardQuery,
    select: (data: MatterDashboard) => data.matters.find((matter) => matter.id === id) ?? null,
  });
}

// --- Matters opened this session -------------------------------------------
// Client state, kept in sessionStorage so it lasts for the tab's session only.

const OPENED_KEY = 'case-digest:opened-matters';
const openedSchema = z.record(z.string(), z.number());
type OpenedMatters = z.infer<typeof openedSchema>;

function readOpened(): OpenedMatters {
  try {
    const raw = sessionStorage.getItem(OPENED_KEY);
    return raw ? openedSchema.parse(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

let opened = readOpened();
const listeners = new Set<() => void>();

function markOpened(id: string) {
  opened = { ...opened, [id]: Date.now() };
  try {
    sessionStorage.setItem(OPENED_KEY, JSON.stringify(opened));
  } catch {
    // Storage blocked: keep the in-memory copy for this page load.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** Map of matter id → when the user last had it open this session. */
export function useOpenedMatters(): OpenedMatters {
  return useSyncExternalStore(subscribe, () => opened);
}

/** Records the matter as seen on open and again on leave. */
export function useMarkMatterOpened(id: string) {
  useEffect(() => {
    markOpened(id);
    return () => markOpened(id);
  }, [id]);
}
