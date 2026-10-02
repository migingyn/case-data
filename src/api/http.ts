import { z } from 'zod';

const errorBodySchema = z.object({ error: z.string() });

/** An `/api` call that failed, carrying the HTTP status so callers can branch on 404. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the Express server in server/ and throws its `{ error }` message on
 * failure. Returns null for 204. Callers parse the body with zod.
 */
export async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = errorBodySchema.safeParse(await response.json().catch(() => null));
    throw new ApiError(response.status, body.success ? body.data.error : `Request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}
