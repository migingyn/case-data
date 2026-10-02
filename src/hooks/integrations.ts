import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  disconnectClio,
  getAiStatus,
  getClioStatus,
  getSyncStatus,
  pingAi,
  syncClio,
} from '@/api/integrations';
import type { SyncStatus } from '@/types/integrations';
import { firmKeys } from './firm';
import { matterKeys } from './matters';

const SYNC_POLL_MS = 2_000;

// One firm-wide connection on the server for now, so no user id in the keys.
export const integrationKeys = {
  all: ['integrations'] as const,
  clioStatus: () => [...integrationKeys.all, 'clio', 'status'] as const,
  syncStatus: () => [...integrationKeys.all, 'sync', 'status'] as const,
  aiStatus: () => [...integrationKeys.all, 'ai', 'status'] as const,
};

export function useClioStatus() {
  return useQuery({ queryKey: integrationKeys.clioStatus(), queryFn: getClioStatus });
}

export function useDisconnectClio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectClio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.clioStatus() }),
  });
}

/** Polls while a sync runs (one starts on its own right after connecting). */
export function useSyncStatus() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: integrationKeys.syncStatus(),
    queryFn: async () => {
      const previous = queryClient.getQueryData<SyncStatus>(integrationKeys.syncStatus());
      const status = await getSyncStatus();
      // A background sync just finished: show its data everywhere.
      if (previous?.running && !status.running) await invalidateSyncedData(queryClient);
      return status;
    },
    refetchInterval: (query) => (query.state.data?.running ? SYNC_POLL_MS : false),
  });
}

function invalidateSyncedData(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: matterKeys.all }),
    queryClient.invalidateQueries({ queryKey: firmKeys.all }),
  ]);
}

export function useSyncClio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncClio,
    onSettled: () =>
      Promise.all([
        invalidateSyncedData(queryClient),
        queryClient.invalidateQueries({ queryKey: integrationKeys.syncStatus() }),
      ]),
  });
}

export function useAiStatus() {
  return useQuery({ queryKey: integrationKeys.aiStatus(), queryFn: getAiStatus });
}

export function usePingAi() {
  return useMutation({ mutationFn: pingAi });
}
