import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Link, useParams } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate } from '@/helpers/matters';
import { useMarkMatterOpened, useMatter } from '@/hooks/matters';

/** Placeholder matter view. Opening it marks the matter as seen this session. */
const MatterPage: FC = () => {
  const { id = '' } = useParams();
  const { data: matter, isPending } = useMatter(id);
  useMarkMatterOpened(id);

  const activity = matter
    ? [...matter.activity].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    : [];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        to="/app"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All matters
      </Link>

      {isPending ? (
        <div className="flex flex-col gap-2" aria-busy>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : !matter ? (
        <p className="font-medium">Matter not found.</p>
      ) : (
        <>
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">{matter.clientName}</h1>
            <p className="mt-1 text-muted-foreground">
              {matter.caseType} · {matter.stage}
            </p>
          </header>
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="text-sm font-medium">
              Activity
            </h2>
            <ul className="mt-3 divide-y rounded-lg border">
              {activity.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
                  <span>{item.summary}</span>
                  <time dateTime={item.occurredAt} className="shrink-0 text-muted-foreground tabular-nums">
                    {formatShortDate(item.occurredAt)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default MatterPage;
