import { Search, X } from 'lucide-react';
import { useMemo, useState, type FC } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  isSinceFilter,
  matchesSearch,
  needsYouToday,
  sinceFilters,
  sortSummaries,
  summarizeMatter,
  type SinceFilter,
  type SortKey,
  type SortState,
} from '@/helpers/matters';
import { useMatterDashboard, useOpenedMatters } from '@/hooks/matters';
import MattersTable from './MattersTable';
import NeedsYouToday from './NeedsYouToday';
import SinceLastVisit from './SinceLastVisit';

/** Columns whose most useful first click is "largest first". */
const DESC_FIRST: ReadonlySet<SortKey> = new Set(['changed', 'contact', 'value']);

/** First click sorts, second reverses, third returns to the default order. */
function nextSort(current: SortState | null, key: SortKey): SortState | null {
  const first = DESC_FIRST.has(key) ? 'desc' : 'asc';
  if (current?.key !== key) return { key, direction: first };
  if (current.direction === first) return { key, direction: first === 'asc' ? 'desc' : 'asc' };
  return null;
}

const HomePage: FC = () => {
  const { data, error, refetch, dataUpdatedAt: now } = useMatterDashboard();
  const opened = useOpenedMatters();
  const [searchParams] = useSearchParams();
  const showParam = searchParams.get('show');
  const filter = isSinceFilter(showParam) ? showParam : null;
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);

  const summaries = useMemo(() => {
    if (!data) return null;
    const lastVisit = Date.parse(data.lastVisitAt);
    return data.matters.map((matter) =>
      summarizeMatter(matter, Math.max(lastVisit, opened[matter.id] ?? 0), now),
    );
  }, [data, opened, now]);

  const counts = useMemo(() => {
    if (!summaries) return null;
    const total = (key: SinceFilter) =>
      summaries.reduce((sum, s) => sum + sinceFilters[key].count(s), 0);
    return {
      changed: total('changed'),
      messages: total('messages'),
      providers: total('providers'),
      overdue: total('overdue'),
    };
  }, [summaries]);

  const visible = useMemo(() => {
    if (!summaries) return null;
    const filtered = summaries.filter(
      (s) => (!filter || sinceFilters[filter].count(s) > 0) && matchesSearch(s.matter, query),
    );
    return sortSummaries(filtered, sort);
  }, [summaries, filter, query, sort]);

  const rail = useMemo(() => (summaries ? needsYouToday(summaries, now) : null), [summaries, now]);

  const hasNoMatters = data?.matters.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Matters</h1>
        <div className="relative w-full sm:w-80">
          <label htmlFor="matter-search" className="sr-only">
            Search matters by client name or case type
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="matter-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search client or case type"
            className="h-9 pl-8"
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg border px-4 py-10 text-center">
          <p className="font-medium">Couldn't load your matters.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <SinceLastVisit lastVisitAt={data?.lastVisitAt ?? null} counts={counts} active={filter} />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <section aria-labelledby="matters-heading" className="min-w-0">
              <div className="mb-3 flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2">
                <h2 id="matters-heading" className="text-sm font-medium">
                  Your matters
                </h2>
                {filter && (
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    {sinceFilters[filter].label}
                    <X aria-hidden className="size-3.5" />
                    <span className="sr-only">, clear filter</span>
                  </Link>
                )}
                {visible && (
                  <p aria-live="polite" className="ml-auto text-[13px] text-muted-foreground tabular-nums">
                    {visible.length} of {summaries?.length ?? 0}
                    <span className="sr-only"> matters shown</span>
                  </p>
                )}
              </div>
              <MattersTable
                summaries={visible}
                now={now}
                sort={sort}
                onSort={(key) => setSort((current) => nextSort(current, key))}
                empty={
                  hasNoMatters ? (
                    <p className="font-medium">No matters yet</p>
                  ) : (
                    <>
                      <p className="font-medium">No matters match</p>
                      <p className="mt-1 text-muted-foreground">
                        Try a different search or{' '}
                        <Link to="/app" onClick={() => setQuery('')} className="text-foreground underline underline-offset-4">
                          clear filters
                        </Link>
                        .
                      </p>
                    </>
                  )
                }
              />
            </section>

            <NeedsYouToday groups={rail} />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
