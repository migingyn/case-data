import type { FC } from 'react';
import { useSearchParams } from 'react-router';
import ClioCard from './ClioCard';
import OpenAiCard from './OpenAiCard';

/** Where the Clio OAuth callback lands, with `?clio=connected` or `?clio=error`. */
const IntegrationsPage: FC = () => {
  const [searchParams] = useSearchParams();
  const clioResult = searchParams.get('clio');

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Case Digest reads matters from Clio and summarizes them with OpenAI. Keys stay on the server.
        </p>
      </div>

      {clioResult === 'error' && (
        <p role="alert" className="rounded-lg border border-destructive/40 px-4 py-3 text-sm">
          Clio didn't finish connecting. Try again, and check that the redirect URI on your Clio app
          matches <code className="font-mono">CLIO_REDIRECT_URI</code>.
        </p>
      )}

      <ClioCard justConnected={clioResult === 'connected'} />
      <OpenAiCard />
    </div>
  );
};

export default IntegrationsPage;
