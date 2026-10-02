import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate } from '@/helpers/matters';
import { defaultShareSettings, shareStatus, type ShareStatus } from '@/helpers/shares';
import { useMatterDashboard, useMatterDetail } from '@/hooks/matters';
import { useMatterShares, useProviderUsers } from '@/hooks/shares';
import type { Share } from '@/types/shares';
import ShareComposer from './ShareComposer';

const statusText = (status: ShareStatus, share: Share | undefined): string => {
  const version = share?.published?.version;
  switch (status) {
    case 'not_shared':
      return 'Not shared yet';
    case 'shared':
      return `Version ${version} published, not opened yet`;
    case 'opened':
      return `Version ${version} opened ${share?.openedAt ? formatShortDate(share.openedAt) : ''}`;
    case 'revoked':
      return 'Access revoked';
    case 'expired':
      return 'Access expired';
  }
};

const SharePage: FC = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dashboard = useMatterDashboard();
  const detailQuery = useMatterDetail(id);
  const sharesQuery = useMatterShares(id);

  const matter = dashboard.data?.matters.find((item) => item.id === id);
  const detail = detailQuery.data;
  const providers = detail?.providers ?? [];
  const provider = providers.find((p) => p.id === searchParams.get('provider')) ?? providers[0];
  const usersQuery = useProviderUsers(provider?.id ?? '');
  const share = sharesQuery.data?.find((item) => item.providerId === provider?.id);
  const now = dashboard.dataUpdatedAt;

  const back = (
    <Link
      to={`/app/matters/${id}`}
      className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {matter ? matter.clientName : 'Back to matter'}
    </Link>
  );

  if (dashboard.isPending || detailQuery.isPending || sharesQuery.isPending || (provider && usersQuery.isPending)) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        {back}
        <Skeleton className="h-8 w-80" />
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!matter || !detail || !provider) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <h1 className="text-2xl font-semibold tracking-tight">Share with a provider</h1>
        <p className="text-muted-foreground">
          {matter ? 'There are no providers on this matter to share with yet.' : 'Matter not found.'}
        </p>
      </div>
    );
  }

  const users = usersQuery.data ?? [];
  const initialSettings =
    share?.draft ?? share?.published?.settings ?? defaultShareSettings(now, users.slice(0, 1).map((u) => u.id));

  return (
    <div className="flex flex-col gap-6">
      {back}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Share with {provider.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {matter.clientName} · {statusText(shareStatus(share, now), share)}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="share-provider" className="text-[13px] font-medium">
            Provider
          </label>
          <Select value={provider.id} onValueChange={(value) => setSearchParams({ provider: value }, { replace: true })}>
            <SelectTrigger id="share-provider" className="h-9 w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} <span className="text-muted-foreground">· {p.specialty}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <ShareComposer
        key={provider.id}
        matter={matter}
        detail={detail}
        provider={provider}
        users={users}
        share={share}
        initialSettings={initialSettings}
        now={now}
      />
    </div>
  );
};

export default SharePage;
