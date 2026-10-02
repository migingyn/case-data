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

/** A run of text on a document page, or a box the firm has redacted. */
export const pageSegmentSchema = z.union([
  z.string(),
  z.object({ redacted: z.number().int().positive() }),
]);
export type PageSegment = z.infer<typeof pageSegmentSchema>;

export const documentPageSchema = z.object({
  number: z.number().int().positive(),
  lines: z.array(z.array(pageSegmentSchema)),
});
export type DocumentPage = z.infer<typeof documentPageSchema>;

export const providerSectionSchema = z.enum([
  'coverage',
  'milestones',
  'requests',
  'treatment',
  'documents',
  'summary',
]);
export type ProviderSection = z.infer<typeof providerSectionSchema>;

/**
 * Exactly what one published version shows a provider, frozen at publish
 * time. Fields for sections that weren't shared are null, and coverage only
 * carries the detail its level allows, so hidden data never reaches them.
 */
export const providerViewSchema = z.object({
  firmName: z.string().min(1),
  practiceName: z.string().min(1),
  sharedBy: z.string().min(1),
  clientName: z.string().min(1),
  caseType: z.string().min(1),
  status: z
    .object({ label: z.string().min(1), tone: z.enum(['active', 'paused', 'closed']) })
    .nullable(),
  coverage: z
    .discriminatedUnion('level', [
      z.object({ level: z.literal('indicator'), onFile: z.boolean(), verifiedAt: z.iso.datetime().nullable() }),
      z.object({
        level: z.literal('carrier'),
        carrier: z.string(),
        type: z.string(),
        verifiedAt: z.iso.datetime(),
      }),
      z.object({
        level: z.literal('limits'),
        limit: z.number().int().nonnegative(),
        carrier: z.string(),
        type: z.string(),
        verifiedAt: z.iso.datetime(),
      }),
      z.object({ level: z.literal('none') }),
    ])
    .nullable(),
  milestones: z
    .object({
      reached: z.array(z.object({ label: z.string(), date: z.iso.datetime() })),
      next: z.object({ label: z.string(), date: z.iso.datetime() }).nullable(),
    })
    .nullable(),
  requests: z
    .array(z.object({ id: z.string(), title: z.string(), dueAt: z.iso.datetime() }))
    .nullable(),
  treatment: z
    .array(
      z.object({
        providerName: z.string(),
        lastVisit: z.object({ date: z.iso.datetime(), attended: z.boolean() }).nullable(),
        nextVisit: z.iso.datetime().nullable(),
        attended: z.number().int().nonnegative(),
        scheduled: z.number().int().nonnegative(),
      }),
    )
    .nullable(),
  documents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        /** Only the permitted pages; the rest are never sent. */
        pages: z.array(documentPageSchema),
      }),
    )
    .nullable(),
  summary: z.array(z.string()).nullable(),
});
export type ProviderView = z.infer<typeof providerViewSchema>;

export const publishedVersionSchema = z.object({
  version: z.number().int().positive(),
  publishedAt: z.iso.datetime(),
  settings: shareSettingsSchema,
  view: providerViewSchema,
});
export type PublishedVersion = z.infer<typeof publishedVersionSchema>;

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
  published: publishedVersionSchema.nullable(),
  /** Every version ever published, oldest first, for "what changed". */
  history: z.array(publishedVersionSchema),
  revokedAt: z.iso.datetime().nullable(),
  /** Latest version the provider has opened. */
  openedVersion: z.number().int().positive().nullable(),
  openedAt: z.iso.datetime().nullable(),
  activity: z.array(shareEventSchema),
  /** First time each section was scrolled into view, per version. */
  sectionViews: z.array(
    z.object({ section: providerSectionSchema, version: z.number().int().positive(), at: z.iso.datetime() }),
  ),
});
export type Share = z.infer<typeof shareSchema>;

export const providerUserSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
});
export type ProviderUser = z.infer<typeof providerUserSchema>;

/** A provider user's own alert choices for one case. */
export const notifyPrefsSchema = z.object({
  milestone: z.boolean(),
  status: z.boolean(),
  request: z.boolean(),
});
export type NotifyPrefs = z.infer<typeof notifyPrefsSchema>;
