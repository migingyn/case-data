import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { MatterSummary, SortKey, SortState } from '@/helpers/matters';
import MatterRow from './MatterRow';

interface MattersTableProps {
  summaries: MatterSummary[] | null;
  now: number;
  sort: SortState | null;
  onSort: (key: SortKey) => void;
  empty: ReactNode;
}

const columns: { key: SortKey; label: string; width: string; align?: 'right' }[] = [
  { key: 'matter', label: 'Matter', width: 'w-[22%]' },
  { key: 'stage', label: 'Stage', width: 'w-[11%]' },
  { key: 'changed', label: 'What changed', width: 'w-[28%]' },
  { key: 'deadline', label: 'Next deadline', width: 'w-[15%]' },
  { key: 'contact', label: 'Last client contact', width: 'w-[12%]' },
  { key: 'value', label: 'Value / coverage', width: 'w-[12%]', align: 'right' },
];

const SKELETON_ROWS = 6;

const SortIcon: FC<{ direction: SortState['direction'] | null }> = ({ direction }) => {
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ChevronsUpDown;
  return <Icon aria-hidden className="size-3.5 shrink-0 opacity-60 group-hover/sort:opacity-100" />;
};

const MattersTable: FC<MattersTableProps> = ({ summaries, now, sort, onSort, empty }) => {
  const isLoading = summaries === null;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[880px] table-fixed text-sm" aria-busy={isLoading}>
        <caption className="sr-only">
          Your matters.{' '}
          {sort
            ? 'Sorted by the selected column.'
            : 'Matters with new items first, then by next deadline.'}
        </caption>
        <thead className="bg-muted/40 text-left text-[13px] text-muted-foreground">
          <tr className="border-b">
            {columns.map((column, index) => {
              const direction = sort?.key === column.key ? sort.direction : null;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined}
                  className={`${column.width} py-2 font-normal ${index === 0 ? 'pl-4' : 'pl-3'} ${index === columns.length - 1 ? 'pr-4' : 'pr-3'}`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={`group/sort -mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 hover:text-foreground ${column.align === 'right' ? 'float-right' : ''} ${direction ? 'text-foreground' : ''}`}
                  >
                    {column.label}
                    <SortIcon direction={direction} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 pr-3 pl-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1.5 h-3 w-24" />
                </td>
                <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-3 py-3"><Skeleton className="h-4 w-full" /></td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-1.5 h-3 w-24" />
                </td>
                <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="py-3 pr-4 pl-3">
                  <Skeleton className="ml-auto h-4 w-16" />
                  <Skeleton className="mt-1.5 ml-auto h-3 w-14" />
                </td>
              </tr>
            ))}
          {summaries?.map((summary) => (
            <MatterRow key={summary.matter.id} summary={summary} now={now} />
          ))}
          {summaries?.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MattersTable;
