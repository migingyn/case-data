import type { FC } from 'react';
import { Link } from 'react-router';
import Panel from '@/components/Panel/Panel';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Injury } from '@/types/matters';

interface InjuriesPanelProps {
  matterId: string;
  injuries: Injury[] | undefined;
}

const statusStyle: Record<Injury['status'], { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'border-border text-foreground' },
  proposed: { label: 'Proposed', className: 'border-warning/40 bg-warning-surface text-warning' },
};

const InjuriesPanel: FC<InjuriesPanelProps> = ({ matterId, injuries }) => (
  <Panel
    id="injuries-heading"
    title="Injuries"
    action={
      <Link
        to={`/app/matters/${matterId}/facts`}
        className="rounded-sm text-[13px] text-muted-foreground hover:text-foreground"
      >
        Review<span className="sr-only"> injuries</span>
      </Link>
    }
  >
    {!injuries ? (
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ) : injuries.length === 0 ? (
      <p className="text-sm text-muted-foreground">No injuries recorded.</p>
    ) : (
      <ul className="flex flex-col gap-3">
        {injuries.map((injury) => {
          const status = statusStyle[injury.status];
          return (
            <li key={injury.id} className="text-sm">
              <p>{injury.description}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', status.className)}>
                  {status.label}
                </span>
                <SourceChip source={injury.source} />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </Panel>
);

export default InjuriesPanel;
