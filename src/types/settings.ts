import { z } from 'zod';

export const catchUpDepthSchema = z.enum(['brief', 'full']);
export type CatchUpDepth = z.infer<typeof catchUpDepthSchema>;

export const userSettingsSchema = z.object({
  /** Which catch-up view a matter opens in. */
  defaultDepth: catchUpDepthSchema,
});
export type UserSettings = z.infer<typeof userSettingsSchema>;
