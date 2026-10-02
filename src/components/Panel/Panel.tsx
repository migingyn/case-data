import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
  title: string;
  /** Unique per page; links the heading to the section for screen readers. */
  id: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bordered section with a small heading row, used for matter view panels. */
const Panel: FC<PanelProps> = ({ title, id, action, children, className }) => (
  <section aria-labelledby={id} className={cn('rounded-lg border', className)}>
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
      <h2 id={id} className="text-sm font-medium">
        {title}
      </h2>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

export default Panel;
