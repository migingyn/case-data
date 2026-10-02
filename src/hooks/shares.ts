import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMatterShares,
  getNotifyPrefs,
  getProviderUsers,
  publishShare,
  recordSectionViewed,
  recordShareOpened,
  revokeShare,
  saveNotifyPrefs,
  saveShareDraft,
} from '@/api/shares';
import type { NotifyPrefs, ProviderSection, ProviderView, ShareSettings } from '@/types/shares';

// Sample data isn't per-user yet; add the user id once shares live in Supabase.
export const shareKeys = {
  all: ['shares'] as const,
  matter: (matterId: string) => [...shareKeys.all, 'matter', matterId] as const,
  providerUsers: (providerId: string) => [...shareKeys.all, 'provider-users', providerId] as const,
  notifyPrefs: (matterId: string, providerId: string) =>
    [...shareKeys.all, 'notify-prefs', matterId, providerId] as const,
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
  return useShareMutation(matterId, ({ providerId, settings, view }: ShareArgs & { view: ProviderView }) =>
    publishShare(matterId, providerId, settings, view),
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

export function useRecordSectionViewed(matterId: string) {
  return useShareMutation(matterId, ({ providerId, section }: { providerId: string; section: ProviderSection }) =>
    recordSectionViewed(matterId, providerId, section),
  );
}

export function useNotifyPrefs(matterId: string, providerId: string) {
  return useQuery({
    queryKey: shareKeys.notifyPrefs(matterId, providerId),
    queryFn: () => getNotifyPrefs(matterId, providerId),
  });
}

/** Saves on every change; the cache updates first so the checkbox never lags. */
export function useSaveNotifyPrefs(matterId: string, providerId: string) {
  const queryClient = useQueryClient();
  const key = shareKeys.notifyPrefs(matterId, providerId);
  return useMutation({
    mutationFn: (prefs: NotifyPrefs) => saveNotifyPrefs(matterId, providerId, prefs),
    onMutate: async (prefs) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotifyPrefs>(key);
      queryClient.setQueryData(key, prefs);
      return { previous };
    },
    onError: (_error, _prefs, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
