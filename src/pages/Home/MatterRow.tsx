import type { FC } from 'react';
import { Link } from 'react-router';
import {
  CONTACT_GAP_DAYS,
  formatCurrency,
  formatDaysAgo,
  formatDue,
  formatShortDate,
  type MatterSummary,
} from '@/helpers/matters';
import { cn } from '@/lib/utils';

interface MatterRowProps {
  summary: MatterSummary;
  now: number;
}

const MatterRow: FC<MatterRowProps> = ({ summary, now }) => {
  const { matter, newItems, nextTask, overdueTasks, contactDays, hasContactGap } = summary;
  const headline = newItems[0];
  const nextIsOverdue = nextTask !== null && overdueTasks.includes(nextTask);

  return (
    <tr className="relative border-b transition-colors last:border-0 hover:bg-muted/50">
      <td className="py-3 pr-3 pl-4">
        {/* One link per row; its ::after stretches over the whole row. */}
        <Link
          to={`/app/matters/${matter.id}`}
          className="block min-w-0 outline-none after:absolute after:inset-0 focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-focus focus-visible:after:ring-inset"
        >
          <span className="block truncate font-medium">{matter.clientName}</span>
          <span className="block truncate text-[13px] text-muted-foreground">{matter.caseType}</span>
        </Link>
      </td>
      <td className="px-3 py-3 text-muted-foreground">{matter.stage}</td>
      <td className="px-3 py-3">
        {headline ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-new-surface px-2 py-0.5 text-xs font-medium text-new tabular-nums">
              New {newItems.length}
            </span>
            <span className="truncate" title={headline.summary}>
              {headline.summary}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">No change</span>
        )}
      </td>
      <td className="px-3 py-3">
        {nextTask ? (
          <>
            <span className={cn('block truncate', nextIsOverdue && 'font-medium text-destructive')}>
              {formatDue(nextTask.dueAt, now)}
            </span>
            <span
              className="block truncate text-[13px] text-muted-foreground"
              title={`${formatShortDate(nextTask.dueAt)} · ${nextTask.title}`}
            >
              <span className="tabular-nums">{formatShortDate(nextTask.dueAt)}</span> · {nextTask.title}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </td>
      <td className="px-3 py-3">
        {contactDays === null ? (
          <span className="text-muted-foreground">Not recorded</span>
        ) : (
          <span className={cn(hasContactGap && 'font-semibold text-warning')}>
            {formatDaysAgo(contactDays)}
          </span>
        )}
        {hasContactGap && <span className="sr-only">, over {CONTACT_GAP_DAYS} days</span>}
      </td>
      <td className="py-3 pr-4 pl-3 text-right font-mono text-[13px] tabular-nums">
        <span className="block">
          <span className="sr-only">Value </span>
          {matter.estimatedValue === null ? (
            <span className="text-muted-foreground">No valuation</span>
          ) : (
            formatCurrency(matter.estimatedValue)
          )}
        </span>
        <span className="block text-muted-foreground">
          <span className="sr-only">Coverage </span>
          {matter.coverageLimit === null ? 'Unconfirmed' : formatCurrency(matter.coverageLimit)}
        </span>
      </td>
    </tr>
  );
};

export default MatterRow;
