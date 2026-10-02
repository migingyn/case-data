import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  disconnectClio,
  getAiStatus,
  getClioMatters,
  getClioStatus,
  pingAi,
} from '@/api/integrations';

// One firm-wide connection on the server for now, so no user id in the keys.
export const integrationKeys = {
  all: ['integrations'] as const,
  clio: () => [...integrationKeys.all, 'clio'] as const,
  clioStatus: () => [...integrationKeys.clio(), 'status'] as const,
  clioMatters: () => [...integrationKeys.clio(), 'matters'] as const,
  aiStatus: () => [...integrationKeys.all, 'ai', 'status'] as const,
};

export function useClioStatus() {
  return useQuery({ queryKey: integrationKeys.clioStatus(), queryFn: getClioStatus });
}

export function useClioMatters(enabled: boolean) {
  return useQuery({ queryKey: integrationKeys.clioMatters(), queryFn: getClioMatters, enabled });
}

export function useDisconnectClio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectClio,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: integrationKeys.clioMatters() });
      return queryClient.invalidateQueries({ queryKey: integrationKeys.clioStatus() });
    },
  });
}

export function useAiStatus() {
  return useQuery({ queryKey: integrationKeys.aiStatus(), queryFn: getAiStatus });
}

export function usePingAi() {
  return useMutation({ mutationFn: pingAi });
}
