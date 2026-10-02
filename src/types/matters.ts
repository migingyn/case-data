import { z } from 'zod';
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
  lastClientContactAt: z.iso.datetime(),
  /** Estimated case value in whole dollars. */
  estimatedValue: z.number().int().nonnegative(),
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

export const shareStateSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('opened'), openedAt: z.iso.datetime() }),
  z.object({ state: z.literal('shared') }),
  z.object({ state: z.literal('not_shared') }),
]);
export type ShareState = z.infer<typeof shareStateSchema>;

export const providerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  specialty: z.string().min(1),
  lienType: z.string().min(1),
  lastVisitAt: z.iso.datetime(),
  lastVisitSource: sourceSchema,
  openRequests: z.number().int().nonnegative(),
  share: shareStateSchema,
});
export type Provider = z.infer<typeof providerSchema>;

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
  openedSource: sourceSchema,
  leadAttorney: z.string().min(1),
  sourceUrl: z.url(),
  caseValue: z.object({
    expected: z.number().int().nonnegative(),
    low: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    updatedAt: z.iso.datetime(),
    source: sourceSchema,
  }),
  coverage: z
    .object({
      limit: z.number().int().nonnegative(),
      carrier: z.string().min(1),
      verifiedAt: z.iso.datetime(),
      source: sourceSchema,
    })
    .nullable(),
  firmSpend: z.object({
    amount: z.number().int().nonnegative(),
    asOf: z.iso.datetime(),
    source: sourceSchema,
  }),
  lastContact: z.object({
    at: z.iso.datetime(),
    who: z.string().min(1),
    channel: z.string().min(1),
    source: sourceSchema,
  }),
  summaryAsOf: z.iso.datetime(),
  brief: z.object({
    whereItStands: z.array(sourcedSentenceSchema),
    whatIsNext: z.array(sourcedSentenceSchema),
    watchFor: z.array(sourcedSentenceSchema),
  }),
  rankedEntries: z.array(rankedEntrySchema),
  totalEntries: z.number().int().nonnegative(),
  injuries: z.array(injurySchema),
  providers: z.array(providerSchema),
});
export type MatterDetail = z.infer<typeof matterDetailSchema>;
