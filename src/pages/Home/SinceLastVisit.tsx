import type { FC } from 'react';
import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { sinceFilters, type SinceFilter } from '@/helpers/matters';

interface SinceLastVisitProps {
  lastVisitAt: string | null;
  counts: Record<SinceFilter, number> | null;
  active: SinceFilter | null;
}

const visitFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const filterKeys = Object.keys(sinceFilters) as SinceFilter[];

const SinceLastVisit: FC<SinceLastVisitProps> = ({ lastVisitAt, counts, active }) => (
  <section aria-labelledby="since-heading">
    <div className="flex items-baseline justify-between gap-4">
      <h2 id="since-heading" className="text-sm font-medium">
        Since you were last here
      </h2>
      {lastVisitAt && (
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">Last visit </span>
          <time dateTime={lastVisitAt}>{visitFormat.format(new Date(lastVisitAt))}</time>
        </p>
      )}
    </div>
    <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
      {filterKeys.map((key) => {
        const isActive = active === key;
        return (
          <li key={key} className="bg-background">
            {counts ? (
              <Link
                to={isActive ? '/app' : { search: `?show=${key}` }}
                aria-current={isActive ? 'true' : undefined}
                className="relative flex h-full flex-col gap-1 px-4 py-3 transition-colors outline-offset-[-2px] hover:bg-muted/60 aria-[current]:bg-muted"
              >
                <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                  {counts[key]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {sinceFilters[key].label}
                  {isActive && <span className="sr-only"> (filter on, select to clear)</span>}
                </span>
                {isActive && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
                )}
              </Link>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-3">
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-4 w-32" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  </section>
);

export default SinceLastVisit;
