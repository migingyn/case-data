import { createHash } from 'node:crypto';
import { BRIEF_VERSION, writeBrief, type BriefInput, type BriefSource } from '../ai/brief.ts';
import { env } from '../env.ts';
import { HttpError } from '../errors.ts';
import { loadSources, uiStage } from '../matters/shared.ts';
import { openai } from '../openai.ts';
import { check, requireSupabase, unwrap, unwrapMaybe, type ServiceClient } from '../supabase.ts';

// Briefs are cached in matter_summaries. Reads serve the latest one; the
// model only runs when a matter has none, when a sync changed what the
// model would read (input_hash differs), or on an explicit regenerate.

const MAX_ENTRIES = 150;
const MAX_COSTS = 30;

type Block = 'where_it_stands' | 'what_is_next' | 'watch_for';
const BLOCKS: Block[] = ['where_it_stands', 'what_is_next', 'watch_for'];

interface LoadedInput {
  input: BriefInput;
  inputHash: string;
  /** ref → citation id, plus the entry id for E refs. */
  refs: Map<string, { citationId: number; entryId?: number }>;
  totalEntries: number;
}

const day = (iso: string) => iso.slice(0, 10);

async function loadBriefInput(db: ServiceClient, firmId: number, matterId: number): Promise<LoadedInput> {
  const matter = unwrap(
    await db
      .from('matters')
      .select('client_id, case_type, stage, opened_on')
      .eq('firm_id', firmId)
      .eq('id', matterId)
      .single(),
    'matter read',
  );
  const [client, entries, entryCount, tasks, costs] = await Promise.all([
    db.from('clients').select('full_name').eq('id', matter.client_id).single(),
    db
      .from('matter_entries')
      .select('id, kind, summary, occurred_at, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('occurred_at', { ascending: false })
      .order('id')
      .limit(MAX_ENTRIES),
    db.from('matter_entries').select('id', { count: 'exact', head: true }).eq('firm_id', firmId).eq('matter_id', matterId),
    db
      .from('tasks')
      .select('id, title, due_at, waiting_on, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .is('completed_at', null)
      .order('due_at')
      .order('id'),
    db
      .from('costs')
      .select('amount, incurred_on, description, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('incurred_on', { ascending: false })
      .order('citation_id')
      .limit(MAX_COSTS),
  ]);
  const entryRows = unwrap(entries, 'entry read');
  const taskRows = unwrap(tasks, 'task read');
  const costRows = unwrap(costs, 'cost read');
  if (entryCount.error) throw new Error(`Supabase entry count failed: ${entryCount.error.message}`);

  const sources = await loadSources(db, [
    ...entryRows.map((e) => e.citation_id),
    ...taskRows.map((t) => t.citation_id),
    ...costRows.map((c) => c.citation_id),
  ]);
  const excerptOf = (citationId: number) => sources.get(citationId)?.excerpt ?? '';

  const refs: LoadedInput['refs'] = new Map();
  const list: BriefSource[] = [];
  for (const e of entryRows) {
    refs.set(`E${e.id}`, { citationId: e.citation_id, entryId: e.id });
    list.push({ ref: `E${e.id}`, kind: e.kind, date: day(e.occurred_at), title: e.summary, excerpt: excerptOf(e.citation_id) });
  }
  for (const t of taskRows) {
    refs.set(`T${t.id}`, { citationId: t.citation_id });
    const waiting = t.waiting_on ? `, waiting on ${t.waiting_on}` : '';
    list.push({ ref: `T${t.id}`, kind: 'open task', date: `due ${day(t.due_at)}`, title: `${t.title}${waiting}`, excerpt: excerptOf(t.citation_id) });
  }
  for (const c of costRows) {
    // Costs are re-inserted on every sync, so their row ids change; the
    // citation id is stable, which keeps the input hash stable.
    refs.set(`C${c.citation_id}`, { citationId: c.citation_id });
    list.push({ ref: `C${c.citation_id}`, kind: 'cost', date: c.incurred_on, title: `${c.description}: $${c.amount.toFixed(2)}`, excerpt: excerptOf(c.citation_id) });
  }

  const input: BriefInput = {
    clientName: unwrap(client, 'client read').full_name,
    caseType: matter.case_type,
    stage: uiStage(matter.stage),
    openedOn: matter.opened_on,
    today: new Date().toISOString().slice(0, 10),
    sources: list,
  };
  // Today is left out of the hash: the brief goes stale when records
  // change, not every midnight.
  const { today: _today, ...stable } = input;
  const inputHash = createHash('sha256')
    .update(JSON.stringify({ version: BRIEF_VERSION, model: env.OPENAI_MODEL, input: stable }))
    .digest('hex');
  return { input, inputHash, refs, totalEntries: entryCount.count ?? entryRows.length };
}

async function latestInputHash(db: ServiceClient, firmId: number, matterId: number): Promise<string | null | undefined> {
  const row = unwrapMaybe(
    await db
      .from('matter_summaries')
      .select('input_hash')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    'summary lookup',
  );
  // undefined: no brief yet. null: a brief from before hashes existed.
  return row ? row.input_hash : undefined;
}

/** Writes a new brief for the matter. Only refs present in the input are kept. */
async function generateBrief(db: ServiceClient, firmId: number, matterId: number): Promise<void> {
  const { input, inputHash, refs, totalEntries } = await loadBriefInput(db, firmId, matterId);
  if (input.sources.length === 0) throw new HttpError(422, 'This matter has no records to summarize yet.');
  const draft = await writeBrief(input);

  const sentenceRows = BLOCKS.flatMap((block) =>
    draft[block]
      .filter((sentence) => refs.has(sentence.source))
      .map((sentence, position) => ({ block, position, text: sentence.text, citation_id: refs.get(sentence.source)!.citationId })),
  );
  if (sentenceRows.length === 0) throw new HttpError(502, 'The model returned no usable sentences. Try again.');
  const providerRows = draft.provider_summary.map((text, position) => ({
    block: 'provider' as const,
    position,
    text,
    citation_id: null,
  }));
  const seen = new Set<number>();
  const rankedRows = draft.ranked_entries
    .flatMap((ranked) => {
      const entryId = refs.get(ranked.entry)?.entryId;
      if (entryId === undefined || seen.has(entryId)) return [];
      seen.add(entryId);
      return [{ entry_id: entryId, title: ranked.title, reason: ranked.reason }];
    })
    .slice(0, 10)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const summary = unwrap(
    await db
      .from('matter_summaries')
      .insert({ firm_id: firmId, matter_id: matterId, model: env.OPENAI_MODEL, total_entries: totalEntries, input_hash: inputHash })
      .select('id')
      .single(),
    'summary insert',
  );
  try {
    check(
      await db
        .from('summary_sentences')
        .insert([...sentenceRows, ...providerRows].map((row) => ({ ...row, firm_id: firmId, summary_id: summary.id }))),
      'sentence insert',
    );
    if (rankedRows.length > 0) {
      check(
        await db
          .from('summary_ranked_entries')
          .insert(rankedRows.map((row) => ({ ...row, firm_id: firmId, summary_id: summary.id }))),
        'ranked entry insert',
      );
    }
  } catch (error) {
    // Never leave a half-written brief as the latest one.
    await db.from('matter_summaries').delete().eq('id', summary.id);
    throw error;
  }
}

const inFlight = new Map<number, Promise<void>>();
const failures = new Map<number, string>();

function run(firmId: number, matterId: number): Promise<void> {
  const existing = inFlight.get(matterId);
  if (existing) return existing;
  const job = generateBrief(requireSupabase(), firmId, matterId)
    .then(() => {
      failures.delete(matterId);
    })
    .catch((error: unknown) => {
      // Keep only a safe message: model and database errors can echo record text.
      failures.set(matterId, error instanceof HttpError ? error.message : "Couldn't write the brief. Try again.");
      console.error(`Brief generation failed: ${error instanceof Error ? error.name : 'error'}`);
    })
    .finally(() => {
      inFlight.delete(matterId);
    });
  inFlight.set(matterId, job);
  return job;
}

export type BriefRunStatus = 'generating' | 'failed' | 'idle';

export function briefStatus(matterId: number): BriefRunStatus {
  if (inFlight.has(matterId)) return 'generating';
  return failures.has(matterId) ? 'failed' : 'idle';
}

export const briefFailure = (matterId: number) => failures.get(matterId) ?? null;

export const isBriefConfigured = () => openai !== null;

/** Starts a brief in the background, or joins the one already running. */
export function startBrief(firmId: number, matterId: number): void {
  if (!isBriefConfigured()) {
    failures.set(matterId, 'OpenAI is not configured. Set OPENAI_API_KEY.');
    return;
  }
  failures.delete(matterId);
  void run(firmId, matterId);
}

/**
 * After a sync: regenerates the brief of each matter whose records changed
 * since its brief was written. Matters without a brief wait for first open.
 */
export async function refreshStaleBriefs(firmId: number, matterIds: number[]): Promise<void> {
  if (!isBriefConfigured()) return;
  const db = requireSupabase();
  for (const matterId of matterIds) {
    try {
      const current = await latestInputHash(db, firmId, matterId);
      if (current === undefined) continue;
      const { inputHash } = await loadBriefInput(db, firmId, matterId);
      if (inputHash !== current) await run(firmId, matterId);
    } catch (error) {
      console.error(`Brief refresh check failed: ${error instanceof Error ? error.name : 'error'}`);
    }
  }
}
