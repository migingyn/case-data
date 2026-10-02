import type { FC } from 'react';
import Panel from '@/components/Panel/Panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { clioConnectUrl } from '@/api/integrations';
import { useClioMatters, useClioStatus, useDisconnectClio } from '@/hooks/integrations';

interface ClioCardProps {
  justConnected: boolean;
}

const ClioCard: FC<ClioCardProps> = ({ justConnected }) => {
  const { data: status, error, refetch } = useClioStatus();
  const connected = status?.connected ?? false;
  const matters = useClioMatters(connected);
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
          <ClioMatterList query={matters} />
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

const ClioMatterList: FC<{ query: ReturnType<typeof useClioMatters> }> = ({ query }) => {
  if (query.error) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load matters: {query.error.message}
      </p>
    );
  }
  if (!query.data) return <Skeleton className="h-24 w-full" />;
  if (query.data.length === 0) return <p className="text-muted-foreground">No matters in this Clio account yet.</p>;

  return (
    <div>
      <h3 className="mb-2 font-medium">Latest matters in Clio</h3>
      <ul className="divide-y rounded-md border">
        {query.data.map((matter) => (
          <li key={matter.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
            <span className="font-mono text-[13px] text-muted-foreground">{matter.displayNumber}</span>
            <span className="min-w-0 flex-1 truncate">
              {matter.clientName ?? 'No client'}
              {matter.description && <span className="text-muted-foreground"> · {matter.description}</span>}
            </span>
            <Badge variant="outline">{matter.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClioCard;
