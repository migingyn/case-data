import type { FC } from 'react';
import Panel from '@/components/Panel/Panel';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate } from '@/helpers/matters';
import { cn } from '@/lib/utils';
import type { Provider, ShareState } from '@/types/matters';

interface ProvidersPanelProps {
  providers: Provider[] | undefined;
}

function shareLabel(share: ShareState): { text: string; className: string } {
  switch (share.state) {
    case 'opened':
      return { text: `Opened ${formatShortDate(share.openedAt)}`, className: 'text-foreground' };
    case 'shared':
      return { text: 'Shared but not opened', className: 'text-warning' };
    case 'not_shared':
      return { text: 'Not shared', className: 'text-muted-foreground' };
  }
}

const ProvidersPanel: FC<ProvidersPanelProps> = ({ providers }) => (
  <Panel id="providers-heading" title="Providers and sharing">
    {!providers ? (
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ) : providers.length === 0 ? (
      <p className="text-sm text-muted-foreground">No providers on this matter.</p>
    ) : (
      <ul className="-my-2 flex flex-col divide-y">
        {providers.map((provider) => {
          const share = shareLabel(provider.share);
          return (
            <li key={provider.id} className="py-3 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium">{provider.name}</p>
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
                <span className={cn(provider.openRequests > 0 && 'text-foreground')}>
                  <span className="font-mono tabular-nums">{provider.openRequests}</span> open{' '}
                  {provider.openRequests === 1 ? 'request' : 'requests'}
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
