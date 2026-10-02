import { useCallback, useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router';
import ProviderCaseView from '@/components/ProviderCaseView/ProviderCaseView';
import { Skeleton } from '@/components/ui/skeleton';
import { changedSections, providerSectionLabels, shareStatus } from '@/helpers/shares';
import { useFirm } from '@/hooks/firm';
import { useMatterShares, useProviderUsers, useRecordSectionViewed, useRecordShareOpened } from '@/hooks/shares';
import { firstTimeThisSession } from '@/lib/sessionStore';
import type { ProviderSection } from '@/types/shares';
import TellMeWhen from './TellMeWhen';

const Notice: FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-lg border px-6 py-12 text-center">
    <h1 className="font-semibold">{title}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
  </div>
);

/**
 * Provider case view (screen 9). Shows the frozen published version only,
 * records the open and which sections were viewed, and flags what changed
 * since the provider's last visit.
 */
const ProviderCasePage: FC = () => {
  const { providerId = '', matterId = '' } = useParams();
  const sharesQuery = useMatterShares(matterId);
  const usersQuery = useProviderUsers(providerId);
  const firmName = useFirm().data?.name ?? 'the firm';
  const recordOpened = useRecordShareOpened(matterId);
  const recordSection = useRecordSectionViewed(matterId);

  const share = sharesQuery.data?.find((item) => item.providerId === providerId);
  const published = share?.published ?? null;
  const now = sharesQuery.dataUpdatedAt;
  const status = shareStatus(share, now);
  const isLive = status === 'shared' || status === 'opened';
  // Prototype stand-in for the signed-in provider user: the first recipient.
  const viewer = usersQuery.data?.find((u) => published?.settings.recipientIds.includes(u.id));

  // The version this user saw last, captured once before this visit records a new open.
  const [lastSeenVersion, setLastSeenVersion] = useState<number | null | undefined>(undefined);
  if (sharesQuery.data && lastSeenVersion === undefined) {
    setLastSeenVersion(share?.openedVersion ?? null);
  }

  const { mutate: markOpened } = recordOpened;
  useEffect(() => {
    if (!isLive || !published || !viewer || lastSeenVersion === undefined) return;
    if (firstTimeThisSession(`case-digest:opened:${matterId}:${providerId}:${published.version}`)) {
      markOpened({ providerId, viewerName: viewer.name });
    }
  }, [isLive, published, viewer, lastSeenVersion, matterId, providerId, markOpened]);

  const { mutate: markSection } = recordSection;
  const version = published?.version;
  const onSectionSeen = useCallback(
    (section: ProviderSection) => {
      if (version && firstTimeThisSession(`case-digest:viewed:${matterId}:${providerId}:${version}:${section}`)) {
        markSection({ providerId, section });
      }
    },
    [version, matterId, providerId, markSection],
  );

  if (sharesQuery.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="mt-4 h-64" />
      </div>
    );
  }

  if (status === 'revoked' || status === 'expired') {
    return (
      <Notice
        title="This case is no longer shared with your office"
        body={`Contact ${firmName} if you still need access to this case.`}
      />
    );
  }
  if (!published) {
    return (
      <Notice
        title="Nothing has been shared with your office yet"
        body={`You'll get an email when ${firmName} shares this case.`}
      />
    );
  }

  const previous =
    lastSeenVersion && lastSeenVersion < published.version
      ? share?.history.find((v) => v.version === lastSeenVersion)
      : undefined;
  const changed = previous ? changedSections(previous.view, published.view) : new Set<ProviderSection>();

  return (
    <div className="flex flex-col gap-4">
      {previous && (
        <div role="status" className="rounded-lg border border-new/30 bg-new-surface px-4 py-3 text-sm">
          <p className="font-semibold text-new">Updated since you last visited</p>
          <p className="mt-0.5 text-foreground">
            Version {published.version} replaces version {previous.version}.
            {changed.size > 0 &&
              ` Changed: ${[...changed].map((section) => providerSectionLabels[section]).join(', ')}.`}
          </p>
        </div>
      )}
      <ProviderCaseView
        view={published.view}
        version={published.version}
        updatedAt={published.publishedAt}
        now={now}
        mode="live"
        changed={changed}
        onSectionSeen={onSectionSeen}
        uploadHref={(requestId) => `/provider/${providerId}/matters/${matterId}/requests/${requestId}/upload`}
      >
        <TellMeWhen matterId={matterId} providerId={providerId} />
      </ProviderCaseView>
    </div>
  );
};

export default ProviderCasePage;
