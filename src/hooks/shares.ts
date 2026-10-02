import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMatterShares,
  getProviderUsers,
  publishShare,
  recordShareOpened,
  revokeShare,
  saveShareDraft,
} from '@/api/shares';
import type { ShareSettings } from '@/types/shares';

// Sample data isn't per-user yet; add the user id once shares live in Supabase.
export const shareKeys = {
  all: ['shares'] as const,
  matter: (matterId: string) => [...shareKeys.all, 'matter', matterId] as const,
  providerUsers: (providerId: string) => [...shareKeys.all, 'provider-users', providerId] as const,
};

export function useMatterShares(matterId: string) {
  return useQuery({
    queryKey: shareKeys.matter(matterId),
    queryFn: () => getMatterShares(matterId),
    // The provider view runs in another tab; refetch when either tab regains focus.
    refetchOnWindowFocus: 'always',
  });
}

export function useProviderUsers(providerId: string) {
  return useQuery({
    queryKey: shareKeys.providerUsers(providerId),
    queryFn: () => getProviderUsers(providerId),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: providerId !== '',
  });
}

function useShareMutation<TArgs>(
  matterId: string,
  mutationFn: (args: TArgs) => ReturnType<typeof publishShare>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (share) => {
      queryClient.setQueryData(shareKeys.matter(matterId), (current: typeof share[] | undefined) => [
        ...(current ?? []).filter((item) => item.providerId !== share.providerId),
        share,
      ]);
    },
  });
}

interface ShareArgs {
  providerId: string;
  settings: ShareSettings;
}

export function useSaveShareDraft(matterId: string) {
  return useShareMutation(matterId, ({ providerId, settings }: ShareArgs) =>
    saveShareDraft(matterId, providerId, settings),
  );
}

export function usePublishShare(matterId: string) {
  return useShareMutation(matterId, ({ providerId, settings }: ShareArgs) =>
    publishShare(matterId, providerId, settings),
  );
}

export function useRevokeShare(matterId: string) {
  return useShareMutation(matterId, (providerId: string) => revokeShare(matterId, providerId));
}

export function useRecordShareOpened(matterId: string) {
  return useShareMutation(matterId, ({ providerId, viewerName }: { providerId: string; viewerName: string }) =>
    recordShareOpened(matterId, providerId, viewerName),
  );
}
