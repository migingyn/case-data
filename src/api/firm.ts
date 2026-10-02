import { z } from 'zod';
import { sampleFirm } from './sample/firm';

export const firmSchema = z.object({ name: z.string().min(1) });
export type Firm = z.infer<typeof firmSchema>;

/** The firm the signed-in user belongs to. Backed by sample data for now. */
export async function getFirm(): Promise<Firm> {
  return firmSchema.parse(sampleFirm);
}
