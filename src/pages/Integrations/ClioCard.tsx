import type { FC } from 'react';
import Panel from '@/components/Panel/Panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { clioConnectUrl } from '@/api/integrations';
import { formatDateTime } from '@/helpers/matters';
import { useClioStatus, useDisconnectClio, useSyncClio, useSyncStatus } from '@/hooks/integrations';
import type { SyncResult } from '@/types/integrations';

interface ClioCardProps {
  justConnected: boolean;
}

const ClioCard: FC<ClioCardProps> = ({ justConnected }) => {
  const { data: status, error, refetch } = useClioStatus();
  const connected = status?.connected ?? false;
  const disconnect = useDisconnectClio();

  const action = connected ? (
    <Button
      variant="outline"
      size="sm"
      disabled={disconnect.isPending}
      onClick={() => disconnect.mutate()}
    >
      {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
    </Button>
  ) : status?.configured ? (
    <Button size="sm" asChild>
      <a href={clioConnectUrl}>Connect Clio</a>
    </Button>
  ) : null;

  return (
    <Panel id="clio-heading" title="Clio Manage" action={action}>
      {error ? (
        <div role="alert" className="text-sm">
          <p className="font-medium">Couldn't reach the API server.</p>
          <p className="mt-1 text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !status ? (
        <Skeleton className="h-5 w-48" />
      ) : !status.configured ? (
        <p className="text-sm text-muted-foreground">
          Not configured. Set <code className="font-mono">CLIO_CLIENT_ID</code> and{' '}
          <code className="font-mono">CLIO_CLIENT_SECRET</code> in <code className="font-mono">.env</code>{' '}
          and restart the server.
        </p>
      ) : !connected ? (
        <p className="text-sm text-muted-foreground">
          Not connected. Connecting opens Clio to approve read access for this app.
        </p>
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          <p role="status" className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{justConnected ? 'Just connected' : 'Connected'}</Badge>
            as {status.user?.name}
            <span className="text-muted-foreground">{status.user?.email}</span>
          </p>
          <SyncSection />
        </div>
      )}
      {disconnect.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {disconnect.error.message}
        </p>
      )}
    </Panel>
  );
};

const COUNT_LABELS: [keyof SyncResult['counts'], string][] = [
  ['matters', 'Matters'],
  ['entries', 'Record entries'],
  ['tasks', 'Tasks'],
  ['contacts', 'Client contacts'],
  ['costs', 'Costs'],
  ['documents', 'Sources'],
];

const SyncSection: FC = () => {
  const { data: status } = useSyncStatus();
  const sync = useSyncClio();
  const running = sync.isPending || (status?.running ?? false);
  const result = sync.data ?? status?.last ?? null;
  const failure = sync.error?.message ?? status?.error ?? null;

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium">Sync to Case Digest</h3>
          <p className="text-[13px] text-muted-foreground">
            Copies open matters with their notes, emails, calls, tasks, documents, court dates and costs.
          </p>
        </div>
        <Button size="sm" disabled={running} onClick={() => sync.mutate()}>
          {running ? 'Syncing…' : 'Sync now'}
        </Button>
      </div>

      <div aria-live="polite">
        {failure && !running ? (
          <p role="alert" className="text-destructive">{failure}</p>
        ) : running ? (
          <p className="text-muted-foreground">Pulling records from Clio. This can take a minute.</p>
        ) : result ? (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">
              Last synced <time dateTime={result.finishedAt}>{formatDateTime(result.finishedAt)}</time>
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
              {COUNT_LABELS.map(([key, label]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-mono tabular-nums">{result.counts[key]}</dd>
                </div>
              ))}
            </dl>
            {(result.skipped.mattersWithoutClient > 0 || result.skipped.tasksWithoutDueDate > 0) && (
              <p className="text-[13px] text-muted-foreground">
                Skipped {result.skipped.mattersWithoutClient} matters with no client and{' '}
                {result.skipped.tasksWithoutDueDate} tasks with no due date.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Not synced since the server started.</p>
        )}
      </div>
    </div>
  );
};

export default ClioCard;
