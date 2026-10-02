import { ExternalLink, Share2 } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatLongDate, initials } from '@/helpers/matters';
import type { Matter, MatterDetail } from '@/types/matters';

interface MatterHeaderProps {
  matter: Matter;
  /** undefined while loading, null when the sample has no detail. */
  detail: MatterDetail | null | undefined;
}

const MatterHeader: FC<MatterHeaderProps> = ({ matter, detail }) => (
  <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
    <div className="flex min-w-0 items-center gap-4">
      {detail?.photoUrl ? (
        <img src={detail.photoUrl} alt="" className="size-14 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground"
        >
          {initials(matter.clientName)}
        </span>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{matter.clientName}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{matter.caseType}</span>
          <span aria-hidden>·</span>
          {detail === undefined ? (
            <Skeleton className="h-4 w-48" />
          ) : detail ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                Opened <time dateTime={detail.openedAt}>{formatLongDate(detail.openedAt)}</time>
                <SourceChip source={detail.openedSource} />
              </span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span>{matter.stage}</span>
          {detail && (
            <>
              <span aria-hidden>·</span>
              <span>Lead attorney {detail.leadAttorney}</span>
            </>
          )}
        </div>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <Link to={`/app/matters/${matter.id}/share`}>
          <Share2 aria-hidden />
          Share with provider
        </Link>
      </Button>
      {detail && (
        <Button asChild size="sm">
          <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
            Open in source system
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Button>
      )}
    </div>
  </header>
);

export default MatterHeader;
