import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { getMatterDashboard, getMatterDetail } from '@/api/matters';
import { createSessionStore, useSessionValue } from '@/lib/sessionStore';
import type { MatterDashboard } from '@/types/matters';

// Sample data isn't per-user yet. Once matters come from Supabase, add the
// user id to these keys and gate the query on `enabled: !!user`.
export const matterKeys = {
  all: ['matters'] as const,
  dashboard: () => [...matterKeys.all, 'dashboard'] as const,
  detail: (id: string) => [...matterKeys.all, 'detail', id] as const,
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

export function useMatterDetail(id: string) {
  return useQuery({
    queryKey: matterKeys.detail(id),
    queryFn: () => getMatterDetail(id),
  });
}

// --- Matters opened this session -------------------------------------------
// Client state for the prototype: when the user last had each matter open,
// kept in sessionStorage so it lasts for the tab's session only.

const openedStore = createSessionStore(
  'case-digest:opened-matters',
  z.record(z.string(), z.number()),
  {},
);

/** Map of matter id → when the user last had it open this session. */
export function useOpenedMatters(): Record<string, number> {
  return useSessionValue(openedStore);
}

const markOpened = (id: string) => openedStore.set({ ...openedStore.get(), [id]: Date.now() });

/**
 * Opens a matter: returns when it was last opened before this visit (null if
 * never this session), then marks it seen on open and again on leave.
 * Key the calling component by matter id so the snapshot resets per matter.
 */
export function useOpenMatter(id: string): number | null {
  const [previouslyOpenedAt] = useState(() => openedStore.get()[id] ?? null);
  useEffect(() => {
    markOpened(id);
    return () => markOpened(id);
  }, [id]);
  return previouslyOpenedAt;
}
