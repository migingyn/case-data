import type { FC } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ProviderView } from '@/types/shares';

type SharedDocument = NonNullable<ProviderView['documents']>[number];

interface DocumentViewerProps {
  document: SharedDocument | null;
  onClose: () => void;
}

/** Shows only the pages the firm permitted, with redactions as solid black boxes. */
const DocumentViewer: FC<DocumentViewerProps> = ({ document, onClose }) => (
  <Sheet open={document !== null} onOpenChange={(open) => !open && onClose()}>
    <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
      {document && (
        <>
          <SheetHeader className="border-b">
            <SheetTitle>{document.title}</SheetTitle>
            <SheetDescription>
              {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'} shared with you. Black
              boxes are redacted.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto bg-muted/50 p-4">
            {document.pages.map((page) => (
              <section
                key={page.number}
                aria-label={`Page ${page.number}`}
                className="rounded-md border bg-background px-5 py-6 font-serif text-sm leading-7 text-foreground shadow-sm"
              >
                {page.lines.map((line, i) => (
                  <p key={i}>
                    {line.map((segment, j) =>
                      typeof segment === 'string' ? (
                        <span key={j}>{segment}</span>
                      ) : (
                        <span
                          key={j}
                          className="mx-0.5 inline-block h-[1.1em] translate-y-[0.15em] bg-black"
                          style={{ width: `${segment.redacted * 0.55}em` }}
                        >
                          <span className="sr-only">[redacted]</span>
                        </span>
                      ),
                    )}
                  </p>
                ))}
                <p className="mt-4 text-right font-sans text-xs text-muted-foreground">Page {page.number}</p>
              </section>
            ))}
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);

export default DocumentViewer;
