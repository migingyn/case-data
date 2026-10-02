import { Check, FileText, Upload } from 'lucide-react';
import { useState, type FC, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatLongDate, formatShortDate } from '@/helpers/matters';
import { cn } from '@/lib/utils';
import type { ProviderSection, ProviderView } from '@/types/shares';
import DocumentViewer from './DocumentViewer';
import { useSectionsSeen } from './useSectionsSeen';

interface ProviderCaseViewProps {
  view: ProviderView;
  version: number;
  updatedAt: string;
  now: number;
  /** The firm's preview nests under its own heading and can't upload. */
  mode: 'live' | 'preview';
  /** Sections that changed since the provider's last visit. */
  changed?: ReadonlySet<ProviderSection>;
  onSectionSeen?: (section: ProviderSection) => void;
  uploadHref?: (requestId: string) => string;
  /** Provider-only extras, such as alert preferences. */
  children?: ReactNode;
}

const toneStyle = {
  active: 'bg-success-surface text-success',
  paused: 'bg-warning-surface text-warning',
  closed: 'bg-muted text-foreground/75',
} as const;

interface SectionProps {
  id: ProviderSection;
  title: string;
  heading: 'h2' | 'h3';
  isChanged: boolean;
  sectionRef: (element: Element | null) => void;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ id, title, heading: Heading, isChanged, sectionRef, children }) => (
  <section ref={sectionRef} data-section={id} aria-labelledby={`pv-${id}`} className="border-t py-5">
    <div className="flex flex-wrap items-center gap-2">
      <Heading id={`pv-${id}`} className="text-sm font-semibold">
        {title}
      </Heading>
      {isChanged && (
        <span className="rounded-full bg-new-surface px-2 py-0.5 text-xs font-medium text-new">
          Updated<span className="sr-only"> since your last visit</span>
        </span>
      )}
    </div>
    <div className="mt-2 text-sm">{children}</div>
  </section>
);

/**
 * What a provider sees for one published version: the firm's live preview
 * and the provider's own page both render this, so they can't drift apart.
 * Sections that weren't shared are simply absent.
 */
const ProviderCaseView: FC<ProviderCaseViewProps> = ({
  view,
  version,
  updatedAt,
  now,
  mode,
  changed,
  onSectionSeen,
  uploadHref,
  children,
}) => {
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const refFor = useSectionsSeen(onSectionSeen);
  const Title = mode === 'live' ? 'h1' : 'p';
  const section = (id: ProviderSection) => ({
    id,
    heading: mode === 'live' ? ('h2' as const) : ('h3' as const),
    isChanged: changed?.has(id) ?? false,
    sectionRef: refFor(id),
  });

  const { coverage, milestones, requests, treatment, documents, summary } = view;
  const openDoc = documents?.find((doc) => doc.id === openDocId) ?? null;

  return (
    <article>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 pb-5">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{view.firmName} Provider portal</p>
          <Title className="mt-1 text-xl font-semibold tracking-tight">
            {view.clientName}
            <span className="font-normal text-muted-foreground"> · {view.caseType}</span>
          </Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared with {view.practiceName} by {view.sharedBy}. Updated{' '}
            <time dateTime={updatedAt}>{formatLongDate(updatedAt)}</time>, version {version}.
          </p>
        </div>
        {view.status && (
          <p className={cn('shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium', toneStyle[view.status.tone])}>
            {view.status.label}
          </p>
        )}
      </header>

      {coverage && (
        <Section {...section('coverage')} title="Coverage">
          {coverage.level === 'indicator' && (
            <>
              <p>
                Coverage on file: <strong className="font-semibold">{coverage.onFile ? 'Yes' : 'No'}</strong>
              </p>
              {coverage.verifiedAt && (
                <p className="text-muted-foreground">Verified {formatLongDate(coverage.verifiedAt)}</p>
              )}
              <p className="mt-1 text-muted-foreground">The firm has chosen not to display limits.</p>
            </>
          )}
          {coverage.level === 'carrier' && (
            <>
              <p>
                {coverage.carrier} · {coverage.type}
              </p>
              <p className="text-muted-foreground">Verified {formatLongDate(coverage.verifiedAt)}</p>
            </>
          )}
          {coverage.level === 'limits' && (
            <>
              <p>
                <span className="font-mono font-semibold tabular-nums">{formatCurrency(coverage.limit)}</span> limit ·{' '}
                {coverage.carrier} · {coverage.type}
              </p>
              <p className="text-muted-foreground">Verified {formatLongDate(coverage.verifiedAt)}</p>
            </>
          )}
          {coverage.level === 'none' && <p>Coverage on file: not yet confirmed</p>}
        </Section>
      )}

      {milestones && (
        <Section {...section('milestones')} title="Where the case is">
          <ol className="flex flex-col gap-1.5">
            {milestones.reached.map((m) => (
              <li key={m.label} className="flex items-baseline gap-2">
                <Check aria-hidden className="size-3.5 shrink-0 translate-y-0.5" />
                <span className="flex-1">{m.label}</span>
                <time dateTime={m.date} className="font-mono text-[13px] text-muted-foreground tabular-nums">
                  {formatShortDate(m.date)}
                </time>
              </li>
            ))}
          </ol>
          {milestones.next && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="text-muted-foreground">Next:</span>
              <strong className="flex-1 font-semibold">{milestones.next.label}</strong>
              <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
                expected {formatShortDate(milestones.next.date)}
              </span>
            </p>
          )}
        </Section>
      )}

      {requests && (
        <Section {...section('requests')} title={`What ${view.firmName} needs from your office`}>
          {requests.length === 0 ? (
            <p className="text-muted-foreground">Nothing needed right now.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {requests.map((request) => {
                const overdue = Date.parse(request.dueAt) < now;
                return (
                  <li
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p>{request.title}</p>
                      <p className={cn('text-[13px]', overdue ? 'font-medium text-warning' : 'text-muted-foreground')}>
                        {overdue ? 'Overdue, was due ' : 'Due '}
                        <time dateTime={request.dueAt}>{formatLongDate(request.dueAt)}</time>
                      </p>
                    </div>
                    {uploadHref ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to={uploadHref(request.id)}>
                          <Upload aria-hidden />
                          Upload<span className="sr-only"> for {request.title}</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Upload aria-hidden />
                        Upload
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      )}

      {treatment && (
        <Section {...section('treatment')} title="Treatment across providers">
          <ul className="flex flex-col divide-y">
            {treatment.map((row) => (
              <li key={row.providerName} className="py-2.5 first:pt-0">
                <p className="font-medium">{row.providerName}</p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
                  <dt className="text-muted-foreground">Last visit</dt>
                  <dd>
                    {row.lastVisit
                      ? `${formatShortDate(row.lastVisit.date)}, ${row.lastVisit.attended ? 'attended' : 'missed'}`
                      : 'None yet'}
                  </dd>
                  <dt className="text-muted-foreground">Next visit</dt>
                  <dd>{row.nextVisit ? formatShortDate(row.nextVisit) : 'None scheduled'}</dd>
                  <dt className="text-muted-foreground">Attendance</dt>
                  <dd>
                    {row.attended} of {row.scheduled} scheduled visits
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {documents && (
        <Section {...section('documents')} title="Documents shared with you">
          {documents.length === 0 ? (
            <p className="text-muted-foreground">No pages shared yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setOpenDocId(doc.id)}
                    className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60"
                  >
                    <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">{doc.title}</span>
                    <span className="text-[13px] text-muted-foreground">
                      {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <DocumentViewer document={openDoc} onClose={() => setOpenDocId(null)} />
        </Section>
      )}

      {summary && (
        <Section {...section('summary')} title="Case summary">
          <div className="flex flex-col gap-2 leading-6">
            {summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Section>
      )}

      {children}
    </article>
  );
};

export default ProviderCaseView;
