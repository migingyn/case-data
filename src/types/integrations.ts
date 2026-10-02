import { z } from 'zod';

// Responses from the Express server in server/, which holds the Clio and
// OpenAI credentials.

export const clioStatusSchema = z.object({
  /** Client id and secret are set on the server. */
  configured: z.boolean(),
  /** A Clio account has authorized the app and its token still works. */
  connected: z.boolean(),
  user: z.object({ name: z.string(), email: z.string() }).nullable(),
});
export type ClioStatus = z.infer<typeof clioStatusSchema>;

export const syncResultSchema = z.object({
  finishedAt: z.iso.datetime(),
  /** Rows written per table in this run. */
  counts: z.object({
    matters: z.number().int(),
    providers: z.number().int(),
    clients: z.number().int(),
    documents: z.number().int(),
    entries: z.number().int(),
    tasks: z.number().int(),
    contacts: z.number().int(),
    costs: z.number().int(),
  }),
  /** Clio records left out, and why. */
  skipped: z.object({
    mattersWithoutClient: z.number().int(),
    tasksWithoutDueDate: z.number().int(),
  }),
});
export type SyncResult = z.infer<typeof syncResultSchema>;

export const syncStatusSchema = z.object({
  running: z.boolean(),
  /** The last finished sync since the server started, or null. */
  last: syncResultSchema.nullable(),
  /** Why the last sync failed, when it did. */
  error: z.string().nullable(),
});
export type SyncStatus = z.infer<typeof syncStatusSchema>;

export const aiStatusSchema = z.object({
  configured: z.boolean(),
  model: z.string(),
});
export type AiStatus = z.infer<typeof aiStatusSchema>;

export const aiPingSchema = z.object({
  model: z.string(),
  reply: z.string(),
  latencyMs: z.number(),
});
export type AiPing = z.infer<typeof aiPingSchema>;
