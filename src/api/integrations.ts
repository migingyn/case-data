import {
  aiPingSchema,
  aiStatusSchema,
  clioStatusSchema,
  syncResultSchema,
  syncStatusSchema,
  type AiPing,
  type AiStatus,
  type ClioStatus,
  type SyncResult,
  type SyncStatus,
} from '@/types/integrations';
import { apiRequest } from './http';

/** Full-page navigation target: the server redirects on to Clio's consent screen. */
export const clioConnectUrl = '/api/clio/connect';

export async function getClioStatus(): Promise<ClioStatus> {
  return clioStatusSchema.parse(await apiRequest('/api/clio/status'));
}

export async function disconnectClio(): Promise<void> {
  await apiRequest('/api/clio/disconnect', { method: 'POST' });
}

/** Pulls the firm's open matters and their records from Clio into Supabase. */
export async function syncClio(): Promise<SyncResult> {
  return syncResultSchema.parse(await apiRequest('/api/sync', { method: 'POST' }));
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return syncStatusSchema.parse(await apiRequest('/api/sync/status'));
}

export async function getAiStatus(): Promise<AiStatus> {
  return aiStatusSchema.parse(await apiRequest('/api/ai/status'));
}

/** One small model call with a fixed prompt; sends no case data. */
export async function pingAi(): Promise<AiPing> {
  return aiPingSchema.parse(await apiRequest('/api/ai/ping', { method: 'POST' }));
}
