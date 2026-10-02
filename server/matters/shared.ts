import type { MatterStage as UiStage } from '../../src/types/matters';
import type { Source } from '../../src/types/sources';
import type { Database } from '../../src/types/database';
import { unwrap, type ServiceClient } from '../supabase.ts';

const CHUNK_SIZE = 200;

export function chunk<T>(items: T[], size = CHUNK_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Postgres returns `+00:00` offsets; the zod contract wants `Z` instants. */
export const iso = (value: string) => new Date(value).toISOString();

const STAGES: Record<Database['public']['Enums']['matter_stage'], UiStage> = {
  intake: 'Intake',
  treatment: 'Treatment',
  demand: 'Demand',
  negotiation: 'Negotiation',
  litigation: 'Litigation',
  settled: 'Settled',
};

/** Database enums are lowercase; the UI's are capitalised (docs/schema.md). */
export const uiStage = (stage: Database['public']['Enums']['matter_stage']) => STAGES[stage];

/** citations.id → the Source a chip opens, joined with its document. */
export async function loadSources(db: ServiceClient, citationIds: number[]): Promise<Map<number, Source>> {
  const sources = new Map<number, Source>();
  for (const part of chunk([...new Set(citationIds)])) {
    const rows = unwrap(
      await db
        .from('citations')
        .select('id, page, excerpt, document:documents(kind, title, document_date, author)')
        .in('id', part),
      'citation read',
    );
    for (const row of rows) {
      if (!row.document) continue;
      sources.set(row.id, {
        id: String(row.id),
        kind: row.document.kind,
        title: row.document.title,
        date: iso(row.document.document_date),
        page: row.page ?? undefined,
        author: row.document.author ?? undefined,
        excerpt: row.excerpt,
      });
    }
  }
  return sources;
}

/** Looks up a source that must exist; a missing one means a broken citation. */
export function sourceOf(sources: Map<number, Source>, citationId: number): Source {
  const source = sources.get(citationId);
  if (!source) throw new Error(`Citation ${citationId} has no document.`);
  return source;
}

/** The newest row per matter, from rows already sorted newest first. */
export function latestByMatter<T extends { matter_id: number }>(rows: T[]): Map<number, T> {
  const latest = new Map<number, T>();
  for (const row of rows) if (!latest.has(row.matter_id)) latest.set(row.matter_id, row);
  return latest;
}

/** Runs a query per chunk of ids (keeps `in (...)` URLs short) and concatenates the rows. */
export async function inChunks<T>(ids: number[], query: (part: number[]) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (const part of chunk(ids)) rows.push(...(await query(part)));
  return rows;
}
