import { ArrowRight } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import Panel from '@/components/Panel/Panel';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatLongDate } from '@/helpers/matters';
import type { MatterDetail } from '@/types/matters';

interface RankedEntriesProps {
  matterId: string;
  detail: MatterDetail | undefined;
}

const RankedEntries: FC<RankedEntriesProps> = ({ matterId, detail }) => (
  <Panel
    id="ranked-heading"
    title="The ten entries that matter"
    action={
      detail && (
        <Link
          to={`/app/matters/${matterId}/record`}
          className="inline-flex items-center gap-1 rounded-sm text-[13px] text-muted-foreground hover:text-foreground"
        >
          Show all <span className="font-mono tabular-nums">{detail.totalEntries}</span> entries
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      )
    }
  >
    {!detail ? (
      <div className="flex flex-col gap-4" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-6" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ) : detail.rankedEntries.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        The most important entries are picked when the summary is generated.
      </p>
    ) : (
      <ol className="-my-2 flex flex-col divide-y">
        {detail.rankedEntries.slice(0, 10).map((entry, index) => (
          <li key={entry.id} className="flex gap-4 py-3">
            <span className="w-5 shrink-0 pt-px text-right font-mono text-[13px] text-muted-foreground tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-medium">{entry.title}</span>
                <time dateTime={entry.date} className="font-mono text-[13px] text-muted-foreground tabular-nums">
                  {formatLongDate(entry.date)}
                </time>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Ranks high because: {entry.reason}</p>
            </div>
            <SourceChip source={entry.source} className="mt-px" />
          </li>
        ))}
      </ol>
    )}
  </Panel>
);

export default RankedEntries;
