import type {
  Matter,
  MatterDetail,
  Milestone,
  Provider,
  ProviderRequest,
  Visit,
} from '@/types/matters';
import type { CoverageLevel, Share, ShareSettings } from '@/types/shares';
import { formatCurrency } from './matters';

const DAY_MS = 86_400_000;
export const DEFAULT_EXPIRY_DAYS = 90;

export function defaultShareSettings(now: number, recipientIds: string[]): ShareSettings {
  return {
    status: true,
    coverage: true,
    coverageLevel: 'indicator',
    milestones: true,
    treatment: true,
    requests: true,
    summary: false,
    documents: false,
    documentPages: {},
    expiresAt: new Date(now + DEFAULT_EXPIRY_DAYS * DAY_MS).toISOString(),
    recipientIds,
  };
}

export const coverageLevelLabels: Record<CoverageLevel, string> = {
  indicator: 'Indicator only (yes or no)',
  carrier: 'Carrier and type',
  limits: 'Full limits',
};

export type ShareStatus = 'not_shared' | 'shared' | 'opened' | 'revoked' | 'expired';

/** Where a share stands from the provider's side. */
export function shareStatus(share: Share | undefined, now: number): ShareStatus {
  if (!share?.published) return 'not_shared';
  if (share.revokedAt) return 'revoked';
  if (Date.parse(share.published.settings.expiresAt) < now) return 'expired';
  return share.openedVersion === share.published.version ? 'opened' : 'shared';
}

/** "Rosa", "Rosa and Kim", "Rosa, Kim and Sam". */
export function formatNameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** [1, 2, 3, 5] → "pp. 1–3, 5". */
export function formatPages(pages: number[]): string {
  const sorted = [...pages].sort((a, b) => a - b);
  const runs: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i++;
    runs.push(start === sorted[i] ? `${start}` : `${start}–${sorted[i]}`);
  }
  return `${sorted.length === 1 ? 'p.' : 'pp.'} ${runs.join(', ')}`;
}

export function selectedPageCount(settings: ShareSettings): number {
  return Object.values(settings.documentPages).reduce((sum, pages) => sum + pages.length, 0);
}

export interface TreatmentRow {
  providerName: string;
  visits: Visit[];
  attended: number;
  missed: number;
}

/** Exactly what a provider is shown. Anything not set here never reaches them. */
export interface ProviderView {
  clientName: string;
  caseType: string;
  status: string | null;
  coverage: { level: CoverageLevel; text: string } | null;
  milestones: Milestone[] | null;
  treatment: TreatmentRow[] | null;
  requests: ProviderRequest[] | null;
  summary: string[] | null;
  documents: { id: string; title: string; pages: string }[] | null;
}

function coverageText(detail: MatterDetail, level: CoverageLevel): string {
  const coverage = detail.coverage;
  if (!coverage) return 'Not yet confirmed';
  if (level === 'indicator') return 'Yes, insurance coverage is confirmed';
  if (level === 'carrier') return `${coverage.carrier} · ${coverage.type}`;
  return `${formatCurrency(coverage.limit)} limit · ${coverage.carrier} · ${coverage.type}`;
}

export function buildProviderView(
  matter: Matter,
  detail: MatterDetail,
  provider: Provider,
  settings: ShareSettings,
): ProviderView {
  const providerNames = new Map(detail.providers.map((p) => [p.id, p.name]));
  return {
    clientName: matter.clientName,
    caseType: matter.caseType,
    status: settings.status ? (matter.stage === 'Settled' ? 'Settled' : 'Active') : null,
    coverage: settings.coverage
      ? { level: settings.coverageLevel, text: coverageText(detail, settings.coverageLevel) }
      : null,
    milestones: settings.milestones ? detail.milestones : null,
    treatment: settings.treatment
      ? detail.providers.map((p) => {
          const visits = detail.visits
            .filter((visit) => visit.providerId === p.id)
            .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
          return {
            providerName: providerNames.get(p.id) ?? p.name,
            visits,
            attended: visits.filter((v) => v.status === 'attended').length,
            missed: visits.filter((v) => v.status === 'missed').length,
          };
        })
      : null,
    requests: settings.requests
      ? detail.requests.filter((request) => request.providerId === provider.id)
      : null,
    summary: settings.summary ? detail.providerSummary : null,
    documents: settings.documents
      ? detail.documents
          .filter((doc) => (settings.documentPages[doc.id] ?? []).length > 0)
          .map((doc) => ({ id: doc.id, title: doc.title, pages: formatPages(settings.documentPages[doc.id]) }))
      : null,
  };
}
