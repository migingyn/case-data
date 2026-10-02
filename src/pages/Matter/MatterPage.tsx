import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Link, useParams } from 'react-router';
import SourceDrawerProvider from '@/components/SourceDrawer/SourceDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { newActivity } from '@/helpers/matters';
import { useMatterDashboard, useMatterDetail, useOpenMatter } from '@/hooks/matters';
import { useCatchUpDepth } from '@/hooks/settings';
import { useMatterShares } from '@/hooks/shares';
import CatchUpPanel from './CatchUpPanel';
import InjuriesPanel from './InjuriesPanel';
import KpiStrip from './KpiStrip';
import MatterHeader from './MatterHeader';
import ProvidersPanel from './ProvidersPanel';
import RankedEntries from './RankedEntries';
import TasksPanel from './TasksPanel';

const BackLink: FC = () => (
  <Link
    to="/app"
    className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft aria-hidden className="size-4" />
    My matters
  </Link>
);

interface MatterViewProps {
  id: string;
}

const MatterView: FC<MatterViewProps> = ({ id }) => {
  // Snapshot before marking seen, so this visit lists what was new on arrival.
  const previouslyOpenedAt = useOpenMatter(id);
  const dashboard = useMatterDashboard();
  const detailQuery = useMatterDetail(id);
  const [depth, setDepth] = useCatchUpDepth();
  const shares = useMatterShares(id);

  const now = dashboard.dataUpdatedAt;
  const matter = dashboard.data?.matters.find((item) => item.id === id);
  // undefined while loading; null when the sample has no detail for this matter.
  const detail = detailQuery.isPending ? undefined : (detailQuery.data ?? null);

  if (dashboard.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy>
        <BackLink />
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard.data || !matter) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <p className="font-medium">Matter not found.</p>
      </div>
    );
  }

  const seenAt = Math.max(Date.parse(dashboard.data.lastVisitAt), previouslyOpenedAt ?? 0);
  const sinceItems = newActivity(matter, seenAt);

  return (
    <div className="flex flex-col gap-6">
      <BackLink />
      <MatterHeader matter={matter} detail={detail} />
      {detail !== null && <KpiStrip detail={detail} now={now} />}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <CatchUpPanel
            matterId={id}
            sinceItems={sinceItems}
            detail={detail ?? undefined}
            hasDetail={detail !== null}
            depth={depth}
            onDepthChange={setDepth}
          />
          {depth === 'brief' && detail !== null && <RankedEntries matterId={id} detail={detail} />}
        </div>
        <div className="flex flex-col gap-6">
          <TasksPanel tasks={matter.tasks} now={now} />
          {detail !== null && <InjuriesPanel matterId={id} injuries={detail?.injuries} />}
          {detail !== null && (
            <ProvidersPanel
              matterId={id}
              providers={detail?.providers}
              requests={detail?.requests}
              shares={shares.data}
              now={now}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/** Matter view. Keyed by id so per-visit state resets between matters. */
const MatterPage: FC = () => {
  const { id = '' } = useParams();
  return (
    <SourceDrawerProvider>
      <MatterView key={id} id={id} />
    </SourceDrawerProvider>
  );
};

export default MatterPage;
