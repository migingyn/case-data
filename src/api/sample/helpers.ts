// Shared helpers for fabricated sample data. Times are relative to when the
// app loaded so the prototype always has recent activity.
import type { SourceKind } from '@/types/sources';

export const LOADED_AT = Date.now();
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export const ago = (ms: number) => new Date(LOADED_AT - ms).toISOString();
export const ahead = (ms: number) => new Date(LOADED_AT + ms).toISOString();

let nextSourceId = 1;

export function source(
  kind: SourceKind,
  title: string,
  date: string,
  excerpt: string,
  extra: { page?: number; author?: string } = {},
) {
  return { id: `src-${nextSourceId++}`, kind, title, date, excerpt, ...extra };
}
