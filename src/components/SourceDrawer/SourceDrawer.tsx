import { useRef, useState, type FC, type ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatLongDate } from '@/helpers/matters';
import { sourceKindLabel } from '@/helpers/sources';
import type { Source } from '@/types/sources';
import { SourceDrawerContext } from './SourceDrawerContext';

interface SourceDrawerProviderProps {
  children: ReactNode;
}

/**
 * Hosts the Source drawer (screen 4) for everything beneath it. Any
 * SourceChip inside opens the drawer on that chip's source.
 */
const SourceDrawerProvider: FC<SourceDrawerProviderProps> = ({ children }) => {
  const [source, setSource] = useState<Source | null>(null);
  const [open, setOpen] = useState(false);
  // Chips aren't Radix triggers, so return focus to the chip by hand on close.
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const show = (next: Source) => {
    returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSource(next);
    setOpen(true);
  };

  return (
    <SourceDrawerContext.Provider value={show}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          className="gap-0 sm:max-w-md"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusTo.current?.focus();
          }}
        >
          {source && (
            <>
              <SheetHeader className="border-b">
                <p className="text-[13px] text-muted-foreground capitalize">
                  {sourceKindLabel(source.kind)}
                </p>
                <SheetTitle className="text-base">{source.title}</SheetTitle>
                <SheetDescription>
                  <time dateTime={source.date}>{formatLongDate(source.date)}</time>
                  {source.author && <> · {source.author}</>}
                  {source.page && <> · Page {source.page}</>}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 p-4">
                <h3 className="text-[13px] font-medium text-muted-foreground">Cited passage</h3>
                <blockquote className="rounded-md border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
                  {source.excerpt}
                </blockquote>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </SourceDrawerContext.Provider>
  );
};

export default SourceDrawerProvider;
