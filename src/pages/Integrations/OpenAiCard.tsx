import type { FC } from 'react';
import Panel from '@/components/Panel/Panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAiStatus, usePingAi } from '@/hooks/integrations';

const OpenAiCard: FC = () => {
  const { data: status, error } = useAiStatus();
  const ping = usePingAi();

  const action = status?.configured ? (
    <Button variant="outline" size="sm" disabled={ping.isPending} onClick={() => ping.mutate()}>
      {ping.isPending ? 'Testing…' : 'Test OpenAI'}
    </Button>
  ) : null;

  return (
    <Panel id="openai-heading" title="OpenAI" action={action}>
      <div className="flex flex-col gap-3 text-sm">
        {error ? (
          <p role="alert">
            <span className="font-medium">Couldn't reach the API server.</span>{' '}
            <span className="text-muted-foreground">{error.message}</span>
          </p>
        ) : !status ? (
          <Skeleton className="h-5 w-48" />
        ) : status.configured ? (
          <p className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Configured</Badge>
            Model <code className="font-mono">{status.model}</code>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Not configured. Set <code className="font-mono">OPENAI_API_KEY</code> in{' '}
            <code className="font-mono">.env</code> and restart the server.
          </p>
        )}

        <div aria-live="polite">
          {ping.data && (
            <p>
              Model replied “{ping.data.reply}” in {(ping.data.latencyMs / 1000).toFixed(1)}s{' '}
              <span className="text-muted-foreground">({ping.data.model})</span>
            </p>
          )}
          {ping.error && <p className="text-destructive">{ping.error.message}</p>}
        </div>
      </div>
    </Panel>
  );
};

export default OpenAiCard;
