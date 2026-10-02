import { ArrowRight } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime, formatShortDate } from '@/helpers/matters';
import { catchUpDepthSchema, type CatchUpDepth } from '@/types/settings';
import type { Activity, MatterDetail, SourcedSentence } from '@/types/matters';

interface CatchUpPanelProps {
  matterId: string;
  /** This visit's new items, fixed when the page opened. */
  sinceItems: Activity[];
  detail: MatterDetail | undefined;
  /** False when the matter's detail couldn't be found. */
  hasDetail: boolean;
  depth: CatchUpDepth | undefined;
  onDepthChange: (depth: CatchUpDepth) => void;
}

const BriefBlock: FC<{ title: string; sentences: SourcedSentence[] }> = ({ title, sentences }) => (
  <div>
    <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
    <p className="mt-1.5 text-sm leading-7">
      {sentences.map((sentence, i) => (
        <span key={i}>
          {sentence.text} <SourceChip source={sentence.source} />{' '}
        </span>
      ))}
    </p>
  </div>
);

const SinceList: FC<{ items: Activity[] }> = ({ items }) => (
  <div>
    <h3 className="text-sm font-medium">Since you last opened this matter</h3>
    {items.length === 0 ? (
      <p className="mt-2 text-sm text-muted-foreground">Nothing new since you last opened this matter.</p>
    ) : (
      <ul className="mt-2 flex flex-col divide-y rounded-md border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <time dateTime={item.occurredAt} className="w-12 shrink-0 font-mono text-[13px] text-muted-foreground tabular-nums">
              {formatShortDate(item.occurredAt)}
            </time>
            <span className="min-w-0 flex-1">{item.summary}</span>
            <SourceChip source={item.source} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

const CatchUpPanel: FC<CatchUpPanelProps> = ({ matterId, sinceItems, detail, hasDetail, depth, onDepthChange }) => (
  <section aria-labelledby="catch-up-heading" className="rounded-lg border">
    {depth === undefined ? (
      <div className="flex flex-col gap-3 p-4" aria-hidden>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ) : (
      <Tabs value={depth} onValueChange={(value) => onDepthChange(catchUpDepthSchema.parse(value))} className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <h2 id="catch-up-heading" className="text-sm font-medium">
            Catch up
          </h2>
          <TabsList aria-label="Catch-up depth">
            <TabsTrigger value="brief" className="px-2.5">Two-minute brief</TabsTrigger>
            <TabsTrigger value="full" className="px-2.5">Full record</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="brief" className="flex flex-col gap-6 p-4">
          {detail?.summaryAsOf && (
            <p className="text-[13px] text-muted-foreground">
              Summary current as of <time dateTime={detail.summaryAsOf}>{formatDateTime(detail.summaryAsOf)}</time>.
              Shared with everyone on this matter.
            </p>
          )}
          <SinceList items={sinceItems} />
          {!hasDetail ? (
            <p className="text-sm text-muted-foreground">No summary for this matter.</p>
          ) : detail === undefined ? (
            <div className="flex flex-col gap-2" aria-hidden>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : !detail.summaryAsOf ? (
            <p className="text-sm text-muted-foreground">
              No summary yet. The brief appears here once one is generated from this matter's record.
            </p>
          ) : (
            <>
              <BriefBlock title="Where it stands" sentences={detail.brief.whereItStands} />
              <BriefBlock title="What is next" sentences={detail.brief.whatIsNext} />
              <BriefBlock title="Watch for" sentences={detail.brief.watchFor} />
            </>
          )}
        </TabsContent>
        <TabsContent value="full" className="p-4">
          <p className="text-sm text-muted-foreground">
            The full record list is its own screen and isn't built yet.
          </p>
          <Link
            to={`/app/matters/${matterId}/record`}
            className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 hover:underline"
          >
            Open the full record
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </TabsContent>
      </Tabs>
    )}
  </section>
);

export default CatchUpPanel;
