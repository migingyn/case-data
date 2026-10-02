import { userSettingsSchema, type UserSettings } from '@/types/settings';
import { sampleSettings } from './sample/settings';

/** The signed-in user's preferences. Backed by sample data for now. */
export async function getUserSettings(): Promise<UserSettings> {
  return userSettingsSchema.parse(sampleSettings);
}
