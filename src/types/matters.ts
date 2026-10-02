import { z } from 'zod';
import { documentPageSchema } from './shares';
import { sourceSchema } from './sources';

export const matterStages = [
  'Intake',
  'Treatment',
  'Demand',
  'Negotiation',
  'Litigation',
  'Settled',
] as const;
export const matterStageSchema = z.enum(matterStages);
export type MatterStage = z.infer<typeof matterStageSchema>;

export const activityKindSchema = z.enum([
  'offer',
  'court_date',
  'client_message',
  'provider_reply',
  'document',
  'email',
  'note',
]);
export type ActivityKind = z.infer<typeof activityKindSchema>;

export const activitySchema = z.object({
  id: z.string(),
  kind: activityKindSchema,
  summary: z.string().min(1),
  occurredAt: z.iso.datetime(),
  source: sourceSchema,
});
export type Activity = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  dueAt: z.iso.datetime(),
  done: z.boolean(),
  /** Who the firm is waiting on, or null when the next move is the firm's. */
  waitingOn: z.string().nullable(),
  source: sourceSchema,
});
export type Task = z.infer<typeof taskSchema>;

export const matterSchema = z.object({
  id: z.string(),
  clientName: z.string().min(1),
  caseType: z.string().min(1),
  stage: matterStageSchema,
  /** Null when no client contact is on record. */
  lastClientContactAt: z.iso.datetime().nullable(),
  /** Estimated case value in whole dollars; null when there is no valuation. */
  estimatedValue: z.number().int().nonnegative().nullable(),
  /** Liability policy limit in whole dollars; null when not yet confirmed. */
  coverageLimit: z.number().int().nonnegative().nullable(),
  activity: z.array(activitySchema),
  tasks: z.array(taskSchema),
});
export type Matter = z.infer<typeof matterSchema>;

export const matterDashboardSchema = z.object({
  lastVisitAt: z.iso.datetime(),
  matters: z.array(matterSchema),
});
export type MatterDashboard = z.infer<typeof matterDashboardSchema>;

/** A sentence in the catch-up brief, always tied to where it came from. */
export const sourcedSentenceSchema = z.object({
  text: z.string().min(1),
  source: sourceSchema,
});
export type SourcedSentence = z.infer<typeof sourcedSentenceSchema>;

export const injurySchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  /** Confirmed by a medical record, or proposed from notes and not yet confirmed. */
  status: z.enum(['confirmed', 'proposed']),
  source: sourceSchema,
});
export type Injury = z.infer<typeof injurySchema>;

export const providerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  specialty: z.string().min(1),
  lienType: z.string().min(1),
  lastVisitAt: z.iso.datetime(),
  lastVisitSource: sourceSchema,
});
export type Provider = z.infer<typeof providerSchema>;

export const milestoneSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  date: z.iso.datetime(),
  done: z.boolean(),
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const visitSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  date: z.iso.datetime(),
  status: z.enum(['attended', 'missed', 'scheduled']),
});
export type Visit = z.infer<typeof visitSchema>;

/** Something the firm has asked a provider for and not yet received. */
export const providerRequestSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  title: z.string().min(1),
  requestedAt: z.iso.datetime(),
  dueAt: z.iso.datetime(),
});
export type ProviderRequest = z.infer<typeof providerRequestSchema>;

export const shareableDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  pageCount: z.number().int().positive(),
  pages: z.array(documentPageSchema),
});
export type ShareableDocument = z.infer<typeof shareableDocumentSchema>;

export const rankedEntrySchema = z.object({
  id: z.string(),
  date: z.iso.datetime(),
  title: z.string().min(1),
  reason: z.string().min(1),
  source: sourceSchema,
});
export type RankedEntry = z.infer<typeof rankedEntrySchema>;

export const matterDetailSchema = z.object({
  matterId: z.string(),
  photoUrl: z.url().nullable(),
  openedAt: z.iso.datetime(),
  /** The record the opening date comes from, when there is one. */
  openedSource: sourceSchema.nullable(),
  leadAttorney: z.string().min(1).nullable(),
  sourceUrl: z.url(),
  /** Null until a valuation is on file. */
  caseValue: z
    .object({
      expected: z.number().int().nonnegative(),
      low: z.number().int().nonnegative(),
      high: z.number().int().nonnegative(),
      updatedAt: z.iso.datetime(),
      source: sourceSchema,
    })
    .nullable(),
  coverage: z
    .object({
      limit: z.number().int().nonnegative(),
      carrier: z.string().min(1),
      /** Kind of policy, e.g. "Auto liability". */
      type: z.string().min(1),
      verifiedAt: z.iso.datetime(),
      source: sourceSchema,
    })
    .nullable(),
  /** Null when no costs are recorded. */
  firmSpend: z
    .object({
      amount: z.number().int().nonnegative(),
      asOf: z.iso.datetime(),
      source: sourceSchema,
    })
    .nullable(),
  /** Null when no client contact is on record. */
  lastContact: z
    .object({
      at: z.iso.datetime(),
      who: z.string().min(1),
      channel: z.string().min(1),
      source: sourceSchema,
    })
    .nullable(),
  /** When the catch-up brief was generated; null until it has been. */
  summaryAsOf: z.iso.datetime().nullable(),
  /**
   * Whether a brief is being written now (an older one may still show) or
   * the last attempt failed. Defaults for sample data, which has no runs.
   */
  briefStatus: z.enum(['ready', 'generating', 'failed']).default('ready'),
  /** Why the last brief attempt failed, when it did. */
  briefError: z.string().nullable().default(null),
  brief: z.object({
    whereItStands: z.array(sourcedSentenceSchema),
    whatIsNext: z.array(sourcedSentenceSchema),
    watchFor: z.array(sourcedSentenceSchema),
  }),
  rankedEntries: z.array(rankedEntrySchema),
  totalEntries: z.number().int().nonnegative(),
  injuries: z.array(injurySchema),
  providers: z.array(providerSchema),
  milestones: z.array(milestoneSchema),
  visits: z.array(visitSchema),
  requests: z.array(providerRequestSchema),
  documents: z.array(shareableDocumentSchema),
  /** Plain-language summary safe to show providers: no figures, no strategy. */
  providerSummary: z.array(z.string().min(1)),
  /** Why the case is on hold, or null when it is moving. */
  pausedReason: z.string().nullable(),
});
export type MatterDetail = z.infer<typeof matterDetailSchema>;
