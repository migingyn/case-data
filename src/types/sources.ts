import { z } from 'zod';

export const sourceKindSchema = z.enum([
  'letter',
  'email',
  'note',
  'medical_record',
  'bill',
  'policy',
  'filing',
  'call_log',
  'ledger',
  'intake_form',
  'task',
  'message',
  'memo',
  'report',
]);
export type SourceKind = z.infer<typeof sourceKindSchema>;

/** A document or record in the source system that a fact on screen came from. */
export const sourceSchema = z.object({
  id: z.string(),
  kind: sourceKindSchema,
  title: z.string().min(1),
  date: z.iso.datetime(),
  /** Page within the document, when the fact sits on a specific page. */
  page: z.number().int().positive().optional(),
  author: z.string().optional(),
  excerpt: z.string().min(1),
});
export type Source = z.infer<typeof sourceSchema>;
