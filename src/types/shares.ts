import { z } from 'zod';

export const coverageLevelSchema = z.enum(['indicator', 'carrier', 'limits']);
export type CoverageLevel = z.infer<typeof coverageLevelSchema>;

/** What a provider may see. Attorney notes, valuation and strategy are never included. */
export const shareSettingsSchema = z.object({
  status: z.boolean(),
  coverage: z.boolean(),
  coverageLevel: coverageLevelSchema,
  milestones: z.boolean(),
  treatment: z.boolean(),
  requests: z.boolean(),
  summary: z.boolean(),
  documents: z.boolean(),
  /** Document id → selected page numbers. */
  documentPages: z.record(z.string(), z.array(z.number().int().positive())),
  expiresAt: z.iso.datetime(),
  /** Provider practice user ids to notify. */
  recipientIds: z.array(z.string()),
});
export type ShareSettings = z.infer<typeof shareSettingsSchema>;

export const shareEventSchema = z.object({
  id: z.string(),
  at: z.iso.datetime(),
  event: z.enum(['Published', 'Opened by provider', 'Access revoked']),
  version: z.number().int().positive(),
  who: z.string().min(1),
});
export type ShareEvent = z.infer<typeof shareEventSchema>;

export const shareSchema = z.object({
  matterId: z.string(),
  providerId: z.string(),
  /** Last saved settings, published or not. */
  draft: shareSettingsSchema.nullable(),
  /** What the provider currently sees; null until the first publish. */
  published: z
    .object({
      version: z.number().int().positive(),
      publishedAt: z.iso.datetime(),
      settings: shareSettingsSchema,
    })
    .nullable(),
  revokedAt: z.iso.datetime().nullable(),
  /** Latest version the provider has opened. */
  openedVersion: z.number().int().positive().nullable(),
  openedAt: z.iso.datetime().nullable(),
  activity: z.array(shareEventSchema),
});
export type Share = z.infer<typeof shareSchema>;

export const providerUserSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
});
export type ProviderUser = z.infer<typeof providerUserSchema>;
