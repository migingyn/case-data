import type { FC } from 'react';
import { Link } from 'react-router';
import Panel from '@/components/Panel/Panel';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate } from '@/helpers/matters';
import { shareStatus } from '@/helpers/shares';
import { cn } from '@/lib/utils';
import type { Provider, ProviderRequest } from '@/types/matters';
import type { Share } from '@/types/shares';

interface ProvidersPanelProps {
  matterId: string;
  providers: Provider[] | undefined;
  requests: ProviderRequest[] | undefined;
  shares: Share[] | undefined;
  now: number;
}

function shareLabel(share: Share | undefined, now: number): { text: string; className: string } {
  switch (shareStatus(share, now)) {
    case 'opened':
      return { text: `Opened ${share?.openedAt ? formatShortDate(share.openedAt) : ''}`, className: 'text-foreground' };
    case 'shared':
      return { text: 'Shared but not opened', className: 'text-warning' };
    case 'revoked':
      return { text: 'Access revoked', className: 'text-muted-foreground' };
    case 'expired':
      return { text: 'Access expired', className: 'text-muted-foreground' };
    case 'not_shared':
      return { text: 'Not shared', className: 'text-muted-foreground' };
  }
}

const ProvidersPanel: FC<ProvidersPanelProps> = ({ matterId, providers, requests, shares, now }) => (
  <Panel id="providers-heading" title="Providers and sharing">
    {!providers || !shares ? (
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ) : providers.length === 0 ? (
      <p className="text-sm text-muted-foreground">No providers on this matter.</p>
    ) : (
      <ul className="-my-2 flex flex-col divide-y">
        {providers.map((provider) => {
          const share = shareLabel(shares.find((item) => item.providerId === provider.id), now);
          const openRequests = (requests ?? []).filter((r) => r.providerId === provider.id).length;
          return (
            <li key={provider.id} className="py-3 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  to={`/app/matters/${matterId}/share?provider=${provider.id}`}
                  className="rounded-sm font-medium underline-offset-4 hover:underline"
                >
                  {provider.name}
                </Link>
                <p className={cn('shrink-0 text-[13px] font-medium', share.className)}>{share.text}</p>
              </div>
              <p className="text-[13px] text-muted-foreground">
                {provider.specialty} · {provider.lienType}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
                <span>
                  Last visit{' '}
                  <time dateTime={provider.lastVisitAt} className="font-mono tabular-nums">
                    {formatShortDate(provider.lastVisitAt)}
                  </time>
                </span>
                <SourceChip source={provider.lastVisitSource} />
                <span aria-hidden>·</span>
                <span className={cn(openRequests > 0 && 'text-foreground')}>
                  <span className="font-mono tabular-nums">{openRequests}</span> open{' '}
                  {openRequests === 1 ? 'request' : 'requests'}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    )}
  </Panel>
);

export default ProvidersPanel;
