import { z } from 'zod';
import {
  aiPingSchema,
  aiStatusSchema,
  clioMatterSummarySchema,
  clioStatusSchema,
  type AiPing,
  type AiStatus,
  type ClioMatterSummary,
  type ClioStatus,
} from '@/types/integrations';

/** Full-page navigation target: the server redirects on to Clio's consent screen. */
export const clioConnectUrl = '/api/clio/connect';

const errorBodySchema = z.object({ error: z.string() });

/** Calls the Express server and throws its `{ error }` message on failure. */
async function request(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = errorBodySchema.safeParse(await response.json().catch(() => null));
    throw new Error(body.success ? body.data.error : `Request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

export async function getClioStatus(): Promise<ClioStatus> {
  return clioStatusSchema.parse(await request('/api/clio/status'));
}

/** The firm's most recent Clio matters, as proof the connection works. */
export async function getClioMatters(): Promise<ClioMatterSummary[]> {
  return z.array(clioMatterSummarySchema).parse(await request('/api/clio/matters'));
}

export async function disconnectClio(): Promise<void> {
  await request('/api/clio/disconnect', { method: 'POST' });
}

export async function getAiStatus(): Promise<AiStatus> {
  return aiStatusSchema.parse(await request('/api/ai/status'));
}

/** One small model call with a fixed prompt; sends no case data. */
export async function pingAi(): Promise<AiPing> {
  return aiPingSchema.parse(await request('/api/ai/ping', { method: 'POST' }));
}
