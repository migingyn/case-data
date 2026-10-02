import { z } from 'zod';
import { ApiError, apiRequest } from './http';

export const firmSchema = z.object({ name: z.string().min(1) });
export type Firm = z.infer<typeof firmSchema>;

/** Stands in until the first Clio sync creates the firm. */
const UNSYNCED_FIRM: Firm = { name: 'Your firm' };

/** The firm whose Clio account is synced. */
export async function getFirm(): Promise<Firm> {
  try {
    return firmSchema.parse(await apiRequest('/api/firm'));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return UNSYNCED_FIRM;
    throw error;
  }
}
