import type { LucideIcon } from 'lucide-react';
import { CircleAlert, Hourglass, PhoneOff } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import type { AttentionItem, NeedsYouToday as NeedsYouTodayGroups } from '@/helpers/matters';

interface NeedsYouTodayProps {
  groups: NeedsYouTodayGroups | null;
}

const groupMeta: { key: keyof NeedsYouTodayGroups; title: string; icon: LucideIcon; iconClass: string }[] = [
  { key: 'overdue', title: 'Overdue', icon: CircleAlert, iconClass: 'text-destructive' },
  { key: 'waiting', title: 'Waiting on others', icon: Hourglass, iconClass: 'text-muted-foreground' },
  { key: 'contactGaps', title: 'Client contact gaps', icon: PhoneOff, iconClass: 'text-warning' },
];

const ItemList: FC<{ items: AttentionItem[] }> = ({ items }) =>
  items.length === 0 ? (
    <p className="px-2 py-1.5 text-sm text-muted-foreground">Nothing here</p>
  ) : (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/app/matters/${item.matterId}`}
            className="block rounded-md px-2 py-1.5 transition-colors outline-offset-0 hover:bg-muted/60"
          >
            <span className="block truncate text-sm font-medium">{item.title}</span>
            <span className="block truncate text-[13px] text-muted-foreground">{item.detail}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

const NeedsYouToday: FC<NeedsYouTodayProps> = ({ groups }) => (
  <aside aria-labelledby="needs-heading">
    <h2 id="needs-heading" className="text-sm font-medium">
      Needs you today
    </h2>
    <div className="mt-3 grid gap-x-6 gap-y-5 lg:grid-cols-3 xl:grid-cols-1">
      {groupMeta.map(({ key, title, icon: Icon, iconClass }) => (
        <section key={key} aria-labelledby={`needs-${key}`}>
          <h3
            id={`needs-${key}`}
            className="flex items-center gap-2 border-b pb-2 text-[13px] font-medium text-muted-foreground"
          >
            <Icon aria-hidden className={`size-3.5 ${iconClass}`} />
            {title}
            {groups && (
              <span className="ml-auto font-mono tabular-nums">{groups[key].length}</span>
            )}
          </h3>
          <div className="-mx-2 mt-1.5">
            {groups ? (
              <ItemList items={groups[key]} />
            ) : (
              <div className="flex flex-col gap-2 px-2 py-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  </aside>
);

export default NeedsYouToday;
