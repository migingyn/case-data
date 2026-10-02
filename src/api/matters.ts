import { z } from 'zod';
import { matterDetailSchema, matterSchema, type MatterDashboard, type MatterDetail } from '@/types/matters';
import { ApiError, apiRequest } from './http';

const DAY_MS = 86_400_000;
const LAST_VISIT_KEY = 'case-digest:last-visit';
const VISIT_BASELINE_KEY = 'case-digest:visit-baseline';

/**
 * When the user was last here, fixed for this tab's session: the start of
 * their previous session, or a week ago on first use. Kept in browser
 * storage until there's sign-in and `firm_members.last_visit_at` to use.
 */
function visitBaseline(): string {
  const fallback = new Date(Date.now() - 7 * DAY_MS).toISOString();
  try {
    const baseline = sessionStorage.getItem(VISIT_BASELINE_KEY);
    if (baseline) return baseline;
    const previous = localStorage.getItem(LAST_VISIT_KEY) ?? fallback;
    sessionStorage.setItem(VISIT_BASELINE_KEY, previous);
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    return previous;
  } catch {
    return fallback;
  }
}

const dashboardResponseSchema = z.object({ matters: z.array(matterSchema) });

/** The firm's matters, synced from Clio, plus when the user last visited. */
export async function getMatterDashboard(): Promise<MatterDashboard> {
  const { matters } = dashboardResponseSchema.parse(await apiRequest('/api/matters'));
  return { lastVisitAt: visitBaseline(), matters };
}

/** Header facts, KPIs and side panels for one matter. Null when it doesn't exist. */
export async function getMatterDetail(matterId: string): Promise<MatterDetail | null> {
  try {
    return matterDetailSchema.parse(await apiRequest(`/api/matters/${encodeURIComponent(matterId)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Asks the server to write a fresh brief in the background. */
export async function regenerateBrief(matterId: string): Promise<void> {
  await apiRequest(`/api/matters/${encodeURIComponent(matterId)}/brief`, { method: 'POST' });
}
