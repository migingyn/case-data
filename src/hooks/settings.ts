import { useQuery } from '@tanstack/react-query';
import { getUserSettings } from '@/api/settings';
import { createSessionStore, useSessionValue } from '@/lib/sessionStore';
import { catchUpDepthSchema, type CatchUpDepth } from '@/types/settings';

export const settingsKeys = {
  all: ['settings'] as const,
};

export function useUserSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: getUserSettings,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

const depthStore = createSessionStore<CatchUpDepth | null>(
  'case-digest:catch-up-depth',
  catchUpDepthSchema.nullable(),
  null,
);

/**
 * The catch-up depth for this session: the user's choice if they made one,
 * otherwise their default setting. Undefined until settings load.
 */
export function useCatchUpDepth(): [CatchUpDepth | undefined, (depth: CatchUpDepth) => void] {
  const chosen = useSessionValue(depthStore);
  const { data: settings } = useUserSettings();
  return [chosen ?? settings?.defaultDepth, depthStore.set];
}
