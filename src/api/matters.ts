import { matterDashboardSchema, type MatterDashboard } from '@/types/matters';
import { sampleDashboard } from './sample/matters';

const SIMULATED_LATENCY_MS = 600;

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
