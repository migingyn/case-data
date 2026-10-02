import type { FC } from 'react';
import Panel from '@/components/Panel/Panel';
import SourceChip from '@/components/SourceChip/SourceChip';
import { formatDue, formatShortDate, groupTasks, type TaskGroups } from '@/helpers/matters';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/matters';

interface TasksPanelProps {
  tasks: Task[];
  now: number;
}

const groups: { key: keyof TaskGroups; title: string }[] = [
  { key: 'overdue', title: 'Overdue' },
  { key: 'comingUp', title: 'Coming up' },
  { key: 'waiting', title: 'Waiting on someone else' },
];

const TasksPanel: FC<TasksPanelProps> = ({ tasks, now }) => {
  const grouped = groupTasks(tasks, now);
  return (
    <Panel id="tasks-heading" title="Tasks">
      <div className="flex flex-col gap-4">
        {groups.map(({ key, title }) => (
          <section key={key} aria-labelledby={`tasks-${key}`}>
            <h3 id={`tasks-${key}`} className="flex justify-between text-[13px] font-medium text-muted-foreground">
              {title}
              <span className="font-mono tabular-nums">{grouped[key].length}</span>
            </h3>
            {grouped[key].length === 0 ? (
              <p className="mt-1 text-[13px] text-muted-foreground">None</p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-2.5">
                {grouped[key].map((task) => (
                  <li key={task.id} className="text-sm">
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
                      <span className={cn(key === 'overdue' && 'font-medium text-destructive')}>
                        {formatDue(task.dueAt, now)}
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={task.dueAt} className="font-mono tabular-nums">
                        {formatShortDate(task.dueAt)}
                      </time>
                      {task.waitingOn && (
                        <>
                          <span aria-hidden>·</span>
                          <span>Waiting on {task.waitingOn}</span>
                        </>
                      )}
                      <SourceChip source={task.source} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </Panel>
  );
};

export default TasksPanel;
