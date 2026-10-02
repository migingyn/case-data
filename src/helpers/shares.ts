import type { Matter, MatterDetail, Provider } from '@/types/matters';
import {
  providerSectionSchema,
  type CoverageLevel,
  type ProviderSection,
  type ProviderView,
  type Share,
  type ShareSettings,
} from '@/types/shares';

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

const stageStatus: Record<Matter['stage'], string> = {
  Intake: 'Active, intake',
  Treatment: 'Active, in treatment',
  Demand: 'Active, demand sent',
  Negotiation: 'Active, in negotiation',
  Litigation: 'Active, in litigation',
  Settled: 'Closed, settled',
};

function statusOf(matter: Matter, detail: MatterDetail): NonNullable<ProviderView['status']> {
  if (matter.stage === 'Settled') return { label: stageStatus.Settled, tone: 'closed' };
  if (detail.pausedReason) return { label: `Paused, ${detail.pausedReason}`, tone: 'paused' };
  return { label: stageStatus[matter.stage], tone: 'active' };
}

function coverageOf(detail: MatterDetail, level: CoverageLevel): NonNullable<ProviderView['coverage']> {
  const coverage = detail.coverage;
  if (level === 'indicator') {
    return { level, onFile: coverage !== null, verifiedAt: coverage?.verifiedAt ?? null };
  }
  if (!coverage) return { level: 'none' };
  const { carrier, type, verifiedAt } = coverage;
  return level === 'carrier'
    ? { level, carrier, type, verifiedAt }
    : { level, limit: coverage.limit, carrier, type, verifiedAt };
}

function treatmentOf(detail: MatterDetail, now: number): NonNullable<ProviderView['treatment']> {
  return detail.providers.map((p) => {
    const visits = detail.visits
      .filter((visit) => visit.providerId === p.id)
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const past = visits.filter((v) => v.status !== 'scheduled' && Date.parse(v.date) <= now);
    const last = past[past.length - 1];
    const next = visits.find((v) => v.status === 'scheduled' && Date.parse(v.date) > now);
    return {
      providerName: p.name,
      lastVisit: last ? { date: last.date, attended: last.status === 'attended' } : null,
      nextVisit: next?.date ?? null,
      attended: past.filter((v) => v.status === 'attended').length,
      scheduled: past.length,
    };
  });
}

interface ViewContext {
  firmName: string;
  matter: Matter;
  detail: MatterDetail;
  provider: Provider;
  settings: ShareSettings;
  now: number;
}

/**
 * Builds exactly what a provider is shown for these settings. Unshared
 * sections are null and coverage carries only what its level allows, so the
 * result is safe to store and send as is.
 */
export function buildProviderView({ firmName, matter, detail, provider, settings, now }: ViewContext): ProviderView {
  const reached = detail.milestones.filter((m) => m.done);
  const next = detail.milestones.find((m) => !m.done);
  return {
    firmName,
    practiceName: provider.name,
    sharedBy: detail.leadAttorney ?? firmName,
    clientName: matter.clientName,
    caseType: matter.caseType,
    status: settings.status ? statusOf(matter, detail) : null,
    coverage: settings.coverage ? coverageOf(detail, settings.coverageLevel) : null,
    milestones: settings.milestones
      ? {
          reached: reached.map(({ label, date }) => ({ label, date })),
          next: next ? { label: next.label, date: next.date } : null,
        }
      : null,
    requests: settings.requests
      ? detail.requests
          .filter((request) => request.providerId === provider.id)
          .map(({ id, title, dueAt }) => ({ id, title, dueAt }))
      : null,
    treatment: settings.treatment ? treatmentOf(detail, now) : null,
    documents: settings.documents
      ? detail.documents
          .map((doc) => {
            const allowed = new Set(settings.documentPages[doc.id] ?? []);
            return { id: doc.id, title: doc.title, pages: doc.pages.filter((p) => allowed.has(p.number)) };
          })
          .filter((doc) => doc.pages.length > 0)
      : null,
    summary: settings.summary ? detail.providerSummary : null,
  };
}

export const providerSectionLabels: Record<ProviderSection, string> = {
  coverage: 'Coverage',
  milestones: 'Where the case is',
  requests: 'Requests',
  treatment: 'Treatment',
  documents: 'Documents',
  summary: 'Case summary',
};

/** Sections whose content differs between two published versions. */
export function changedSections(before: ProviderView, after: ProviderView): Set<ProviderSection> {
  const changed = new Set<ProviderSection>();
  for (const section of providerSectionSchema.options) {
    if (after[section] !== null && JSON.stringify(before[section]) !== JSON.stringify(after[section])) {
      changed.add(section);
    }
  }
  return changed;
}
