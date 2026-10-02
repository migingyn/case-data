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

export const clioMatterSummarySchema = z.object({
  id: z.number(),
  displayNumber: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  clientName: z.string().nullable(),
});
export type ClioMatterSummary = z.infer<typeof clioMatterSummarySchema>;

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
