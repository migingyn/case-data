import {
  matterDashboardSchema,
  matterDetailSchema,
  type MatterDashboard,
  type MatterDetail,
} from '@/types/matters';
import { sampleMatterDetails } from './sample/matterDetails';
import { sampleDashboard } from './sample/matters';

const SIMULATED_LATENCY_MS = 600;
const DETAIL_LATENCY_MS = 900;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The signed-in user's matters plus when they last visited.
 * Backed by sample data until the matters tables exist in Supabase.
 * Activity dated in the future hasn't "arrived" yet and is held back.
 */
export async function getMatterDashboard(): Promise<MatterDashboard> {
  await wait(SIMULATED_LATENCY_MS);
  const now = Date.now();
  const dashboard = matterDashboardSchema.parse(sampleDashboard);
  return {
    ...dashboard,
    matters: dashboard.matters.map((matter) => ({
      ...matter,
      activity: matter.activity.filter((item) => Date.parse(item.occurredAt) <= now),
    })),
  };
}

/**
 * Header facts, KPIs, the catch-up brief, ranked entries, injuries and
 * providers for one matter. Null when the sample has no detail for it.
 */
export async function getMatterDetail(matterId: string): Promise<MatterDetail | null> {
  await wait(DETAIL_LATENCY_MS);
  const detail = sampleMatterDetails.find((item) => item.matterId === matterId);
  return detail ? matterDetailSchema.parse(detail) : null;
}
