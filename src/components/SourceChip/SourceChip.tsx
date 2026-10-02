import { FileText } from 'lucide-react';
import type { FC } from 'react';
import { sourceChipLabel } from '@/helpers/sources';
import { useOpenSource } from '@/hooks/sources';
import { cn } from '@/lib/utils';
import type { Source } from '@/types/sources';

interface SourceChipProps {
  source: Source;
  className?: string;
}

/** Small citation button, e.g. "letter, p.4". Opens the Source drawer. */
const SourceChip: FC<SourceChipProps> = ({ source, className }) => {
  const openSource = useOpenSource();
  return (
    <button
      type="button"
      onClick={() => openSource(source)}
      title={source.title}
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-md border bg-background px-1.5 align-middle text-xs font-normal whitespace-nowrap text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground',
        className,
      )}
    >
      <FileText aria-hidden className="size-3" />
      <span className="sr-only">Source: </span>
      {sourceChipLabel(source)}
    </button>
  );
};

export default SourceChip;
