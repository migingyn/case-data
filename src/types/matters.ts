import { z } from 'zod';

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
});
export type Activity = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  dueAt: z.iso.datetime(),
  done: z.boolean(),
  /** Who the firm is waiting on, or null when the next move is the firm's. */
  waitingOn: z.string().nullable(),
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
