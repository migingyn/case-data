import { useEffect, useRef, type FC } from 'react';
import { useParams } from 'react-router';
import ProviderCaseView from '@/components/ProviderCaseView/ProviderCaseView';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate } from '@/helpers/matters';
import { buildProviderView, shareStatus } from '@/helpers/shares';
import { useMatterDashboard, useMatterDetail } from '@/hooks/matters';
import { useMatterShares, useProviderUsers, useRecordShareOpened } from '@/hooks/shares';

const Notice: FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-lg border px-6 py-12 text-center">
    <h1 className="font-medium">{title}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
  </div>
);

/**
 * Provider case view (screen 9): what a provider practice sees for a shared
 * case. Shows only the published version, never the firm's unpublished draft.
 */
const ProviderCasePage: FC = () => {
  const { providerId = '', matterId = '' } = useParams();
  const dashboard = useMatterDashboard();
  const detailQuery = useMatterDetail(matterId);
  const sharesQuery = useMatterShares(matterId);
  const usersQuery = useProviderUsers(providerId);
  const recordOpened = useRecordShareOpened(matterId);
  const recordedVersion = useRef<number | null>(null);

  const share = sharesQuery.data?.find((item) => item.providerId === providerId);
  const status = shareStatus(share, dashboard.dataUpdatedAt);
  const version = share?.published?.version ?? null;
  // Prototype stand-in for the signed-in provider user: their first recipient.
  const viewer = usersQuery.data?.find((u) => share?.published?.settings.recipientIds.includes(u.id));

  useEffect(() => {
    if ((status === 'shared' || status === 'opened') && version !== null && viewer) {
      if (share?.openedVersion === version || recordedVersion.current === version) return;
      recordedVersion.current = version;
      recordOpened.mutate({ providerId, viewerName: viewer.name });
    }
  }, [status, version, viewer, share?.openedVersion, providerId, recordOpened]);

  if (dashboard.isPending || detailQuery.isPending || sharesQuery.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-4 h-64" />
      </div>
    );
  }

  const matter = dashboard.data?.matters.find((item) => item.id === matterId);
  const detail = detailQuery.data;
  const provider = detail?.providers.find((p) => p.id === providerId);

  if (status === 'revoked' || status === 'expired') {
    return <Notice title="This case is no longer shared with your office" body="Contact the law firm if you still need access." />;
  }
  if (!share?.published || !matter || !detail || !provider) {
    return <Notice title="Nothing has been shared with your office yet" body="You'll get an email when the law firm shares this case." />;
  }

  const { published } = share;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Shared with {provider.name}</p>
      <ProviderCaseView
        view={buildProviderView(matter, detail, provider, published.settings)}
        versionLabel={`Version ${published.version} · Published ${formatShortDate(published.publishedAt)}`}
      />
    </div>
  );
};

export default ProviderCasePage;
