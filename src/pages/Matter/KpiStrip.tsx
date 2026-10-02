import type { FC, ReactNode } from 'react';
import SourceChip from '@/components/SourceChip/SourceChip';
import { Skeleton } from '@/components/ui/skeleton';
import { daysSince, formatCurrency, formatDaysAgo, formatShortDate } from '@/helpers/matters';
import type { MatterDetail } from '@/types/matters';
import type { Source } from '@/types/sources';

interface KpiStripProps {
  detail: MatterDetail | undefined;
  now: number;
}

interface KpiCardProps {
  label: string;
  figure: ReactNode;
  source: Source | null;
  children: ReactNode;
}

const KpiCard: FC<KpiCardProps> = ({ label, figure, source, children }) => (
  <div className="flex flex-col gap-1 bg-background px-4 py-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-[13px] text-muted-foreground">{label}</h3>
      {source && <SourceChip source={source} />}
    </div>
    <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{figure}</p>
    <div className="text-[13px] text-muted-foreground">{children}</div>
  </div>
);

const Mono: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="font-mono tabular-nums">{children}</span>
);

const KpiStrip: FC<KpiStripProps> = ({ detail, now }) => (
  <section aria-label="Key figures" className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
    {!detail ? (
      Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 bg-background px-4 py-3" aria-hidden>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))
    ) : (
      <>
        <KpiCard
          label="Case value"
          figure={detail.caseValue ? formatCurrency(detail.caseValue.expected) : 'Not valued'}
          source={detail.caseValue?.source ?? null}
        >
          {detail.caseValue ? (
            <>
              <p>
                Range <Mono>{formatCurrency(detail.caseValue.low)}</Mono> to{' '}
                <Mono>{formatCurrency(detail.caseValue.high)}</Mono>
              </p>
              <p>Updated <Mono>{formatShortDate(detail.caseValue.updatedAt)}</Mono></p>
            </>
          ) : (
            <p>No valuation on file yet</p>
          )}
        </KpiCard>
        <KpiCard
          label="Coverage behind it"
          figure={detail.coverage ? formatCurrency(detail.coverage.limit) : 'Unconfirmed'}
          source={detail.coverage?.source ?? null}
        >
          {detail.coverage ? (
            <>
              <p>{detail.coverage.carrier}</p>
              <p>Verified <Mono>{formatShortDate(detail.coverage.verifiedAt)}</Mono></p>
            </>
          ) : (
            <p>No policy on file yet</p>
          )}
        </KpiCard>
        <KpiCard
          label="Firm spend to date"
          figure={formatCurrency(detail.firmSpend?.amount ?? 0)}
          source={detail.firmSpend?.source ?? null}
        >
          {detail.firmSpend ? (
            <p>Latest cost <Mono>{formatShortDate(detail.firmSpend.asOf)}</Mono></p>
          ) : (
            <p>No costs recorded</p>
          )}
        </KpiCard>
        <KpiCard
          label="Last client contact"
          figure={detail.lastContact ? formatDaysAgo(daysSince(detail.lastContact.at, now)) : 'Not recorded'}
          source={detail.lastContact?.source ?? null}
        >
          {detail.lastContact ? (
            <>
              <p>{detail.lastContact.who}</p>
              <p>{detail.lastContact.channel}</p>
            </>
          ) : (
            <p>No calls or emails with the client on file</p>
          )}
        </KpiCard>
      </>
    )}
  </section>
);

export default KpiStrip;
