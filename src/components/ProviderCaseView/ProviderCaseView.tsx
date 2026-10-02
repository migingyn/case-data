import { Check, Circle, FileText } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { formatShortDate } from '@/helpers/matters';
import type { ProviderView } from '@/helpers/shares';
import { cn } from '@/lib/utils';

interface ProviderCaseViewProps {
  view: ProviderView;
  /** e.g. "Version 3 · Published Oct 2", shown at the top as the provider sees it. */
  versionLabel: string;
  /** Heading level for section titles; the preview nests under an h2. */
  headingLevel?: 2 | 3;
}

const visitStyle = {
  attended: 'border-transparent bg-foreground',
  missed: 'border-destructive bg-background',
  scheduled: 'border-border bg-muted',
} as const;

const Section: FC<{ title: string; level: 2 | 3; children: ReactNode }> = ({ title, level, children }) => {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <section className="border-t py-4">
      <Heading className="text-[13px] font-medium text-muted-foreground">{title}</Heading>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
};

/**
 * The provider's view of a shared case. Renders only what is in `view`, so
 * the firm's live preview and the provider's own page always match.
 */
const ProviderCaseView: FC<ProviderCaseViewProps> = ({ view, versionLabel, headingLevel = 2 }) => {
  const level = headingLevel;
  return (
    <article>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">{view.clientName}</p>
          <p className="text-sm text-muted-foreground">{view.caseType}</p>
        </div>
        <p className="font-mono text-[13px] text-muted-foreground tabular-nums">{versionLabel}</p>
      </header>

      {view.status && (
        <Section title="Case status" level={level}>
          <p className="font-medium">{view.status}</p>
        </Section>
      )}

      {view.coverage && (
        <Section title="Coverage" level={level}>
          <p>{view.coverage.text}</p>
        </Section>
      )}

      {view.milestones && (
        <Section title="Case milestones" level={level}>
          <ol className="flex flex-col gap-1.5">
            {view.milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-2">
                {milestone.done ? (
                  <Check aria-hidden className="size-3.5 text-foreground" />
                ) : (
                  <Circle aria-hidden className="size-3.5 text-muted-foreground" />
                )}
                <span className={cn(!milestone.done && 'text-muted-foreground')}>{milestone.label}</span>
                <span className="sr-only">{milestone.done ? '(done)' : '(expected)'}</span>
                <span className="ml-auto font-mono text-[13px] text-muted-foreground tabular-nums">
                  {milestone.done ? '' : 'Expected '}
                  {formatShortDate(milestone.date)}
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {view.treatment && (
        <Section title="Treatment timeline and attendance" level={level}>
          <ul className="flex flex-col gap-2.5">
            {view.treatment.map((row) => (
              <li key={row.providerName}>
                <div className="flex items-baseline justify-between gap-2">
                  <span>{row.providerName}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {row.attended} attended{row.missed > 0 && `, ${row.missed} missed`}
                  </span>
                </div>
                <ol className="mt-1 flex flex-wrap gap-1" aria-label={`Visits with ${row.providerName}`}>
                  {row.visits.map((visit) => (
                    <li
                      key={visit.id}
                      title={`${formatShortDate(visit.date)}: ${visit.status}`}
                      className={cn('size-2.5 rounded-full border', visitStyle[visit.status])}
                    >
                      <span className="sr-only">
                        {formatShortDate(visit.date)}, {visit.status}
                      </span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
          <p aria-hidden className="mt-3 flex gap-4 text-xs text-muted-foreground">
            {(['attended', 'missed', 'scheduled'] as const).map((status) => (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span className={cn('size-2 rounded-full border', visitStyle[status])} />
                {status[0].toUpperCase() + status.slice(1)}
              </span>
            ))}
          </p>
        </Section>
      )}

      {view.requests && (
        <Section title="What our office needs from you" level={level}>
          {view.requests.length === 0 ? (
            <p className="text-muted-foreground">Nothing at the moment.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {view.requests.map((request) => (
                <li key={request.id} className="flex items-baseline justify-between gap-3">
                  <span>{request.title}</span>
                  <span className="shrink-0 font-mono text-[13px] text-muted-foreground tabular-nums">
                    Asked {formatShortDate(request.requestedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {view.summary && (
        <Section title="Case summary" level={level}>
          {view.summary.map((line) => (
            <p key={line} className="leading-6">
              {line}
            </p>
          ))}
        </Section>
      )}

      {view.documents && (
        <Section title="Documents" level={level}>
          {view.documents.length === 0 ? (
            <p className="text-muted-foreground">No pages selected.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {view.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2">
                  <FileText aria-hidden className="size-3.5 text-muted-foreground" />
                  {doc.title}
                  <span className="text-[13px] text-muted-foreground">{doc.pages}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </article>
  );
};

export default ProviderCaseView;
