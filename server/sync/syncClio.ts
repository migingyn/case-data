import type { SyncResult, SyncStatus } from '../../src/types/integrations';
import { refreshStaleBriefs } from '../briefs/briefs.ts';
import { getWhoAmI } from '../clio/client.ts';
import {
  listCalendarEntries,
  listCommunications,
  listDocuments,
  listExpenses,
  listMatters,
  listNotes,
  listRelationships,
  listTasks,
  type ClioMatter,
} from '../clio/resources.ts';
import { HttpError } from '../errors.ts';
import { check, requireSupabase, unwrap, type ServiceClient } from '../supabase.ts';
import {
  fromCalendarEntry,
  fromCommunication,
  fromDocument,
  fromExpense,
  fromNote,
  fromTask,
  providerFromRelationship,
  sourceUrl,
  stageFor,
  type ClioProvider,
  type SourcedRecord,
} from './mapClio.ts';

// Pulls the connected firm's open matters and their records from Clio and
// writes them to Supabase with the service role. Idempotent: rows are keyed
// on Clio ids, so running it again updates rather than duplicates. Writes
// aren't transactional; a failed run is fixed by running it again.

const CHUNK_SIZE = 200;

function chunk<T>(items: T[], size = CHUNK_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function upsertFirm(db: ServiceClient, account: { id: number; name: string }): Promise<number> {
  const firm = unwrap(
    await db
      .from('firms')
      .upsert({ name: account.name, clio_account_id: String(account.id) }, { onConflict: 'clio_account_id' })
      .select('id')
      .single(),
    'firm upsert',
  );
  return firm.id;
}

/** Clio contact id → clients.id */
async function upsertClients(db: ServiceClient, firmId: number, matters: ClioMatter[]): Promise<Map<number, number>> {
  // A client with several matters must appear once per upsert statement.
  const byContact = new Map(matters.flatMap((m) => (m.client ? [[m.client.id, m.client.name] as const] : [])));
  const rows = [...byContact].map(([contactId, name]) => ({
    firm_id: firmId,
    full_name: name,
    clio_contact_id: String(contactId),
  }));
  const ids = new Map<number, number>();
  for (const part of chunk(rows)) {
    const saved = unwrap(
      await db.from('clients').upsert(part, { onConflict: 'firm_id,clio_contact_id' }).select('id, clio_contact_id'),
      'client upsert',
    );
    for (const row of saved) ids.set(Number(row.clio_contact_id), row.id);
  }
  return ids;
}

/** Clio matter id → matters.id */
async function upsertMatters(
  db: ServiceClient,
  firmId: number,
  matters: ClioMatter[],
  clientIds: Map<number, number>,
): Promise<Map<number, number>> {
  const syncedAt = new Date().toISOString();
  const rows = matters.map((m) => ({
    firm_id: firmId,
    client_id: clientIds.get(m.client!.id)!,
    case_type: m.practice_area?.name ?? 'General',
    stage: stageFor(m),
    opened_on: (m.open_date ?? m.created_at).slice(0, 10),
    lead_attorney_name: m.responsible_attorney?.name ?? null,
    clio_matter_id: String(m.id),
    source_url: sourceUrl(m.id),
    last_synced_at: syncedAt,
  }));
  const ids = new Map<number, number>();
  for (const part of chunk(rows)) {
    const saved = unwrap(
      await db.from('matters').upsert(part, { onConflict: 'firm_id,clio_matter_id' }).select('id, clio_matter_id'),
      'matter upsert',
    );
    for (const row of saved) ids.set(Number(row.clio_matter_id), row.id);
  }
  return ids;
}

/**
 * Writes a document and its one citation for every record.
 * Returns record key → citations.id, which every sourced row needs.
 */
async function upsertSources(
  db: ServiceClient,
  firmId: number,
  matterIds: Map<number, number>,
  records: SourcedRecord[],
): Promise<Map<string, number>> {
  const documentIds = new Map<string, number>();
  for (const part of chunk(records)) {
    const rows = part.map((r) => ({
      firm_id: firmId,
      matter_id: matterIds.get(r.clioMatterId)!,
      kind: r.document.kind,
      title: r.document.title,
      document_date: r.document.date,
      author: r.document.author,
      clio_document_id: r.key,
    }));
    const saved = unwrap(
      await db.from('documents').upsert(rows, { onConflict: 'firm_id,clio_document_id' }).select('id, clio_document_id'),
      'document upsert',
    );
    for (const row of saved) documentIds.set(row.clio_document_id!, row.id);
  }

  // Citations have no Clio key: find the one already on each document.
  const existing = new Map<number, { id: number; excerpt: string }>();
  for (const part of chunk([...documentIds.values()])) {
    const rows = unwrap(
      await db.from('citations').select('id, document_id, excerpt').eq('firm_id', firmId).in('document_id', part),
      'citation lookup',
    );
    for (const row of rows) existing.set(row.document_id, { id: row.id, excerpt: row.excerpt });
  }

  const citationIds = new Map<string, number>();
  const toInsert: { key: string; documentId: number; excerpt: string }[] = [];
  for (const record of records) {
    const documentId = documentIds.get(record.key)!;
    const current = existing.get(documentId);
    if (!current) {
      toInsert.push({ key: record.key, documentId, excerpt: record.excerpt });
      continue;
    }
    citationIds.set(record.key, current.id);
    if (current.excerpt !== record.excerpt) {
      check(
        await db.from('citations').update({ excerpt: record.excerpt }).eq('id', current.id),
        'citation update',
      );
    }
  }

  const keyByDocument = new Map(toInsert.map((item) => [item.documentId, item.key]));
  for (const part of chunk(toInsert)) {
    const saved = unwrap(
      await db
        .from('citations')
        .insert(part.map((item) => ({ firm_id: firmId, document_id: item.documentId, excerpt: item.excerpt })))
        .select('id, document_id'),
      'citation insert',
    );
    for (const row of saved) citationIds.set(keyByDocument.get(row.document_id)!, row.id);
  }
  return citationIds;
}

/**
 * Treating providers from matter relationships. providers is shared across
 * firms, so its key carries the Clio account. Returns the matter links written.
 */
async function upsertProviders(
  db: ServiceClient,
  firmId: number,
  accountId: number,
  matterIds: Map<number, number>,
  providers: ClioProvider[],
): Promise<number> {
  const keyOf = (p: ClioProvider) => `clio:${accountId}:${p.clioContactId}`;
  // One row per practice even when it treats on several matters.
  const practices = [...new Map(providers.map((p) => [keyOf(p), p]))];
  const providerIds = new Map<string, number>();
  for (const part of chunk(practices)) {
    const saved = unwrap(
      await db
        .from('providers')
        .upsert(part.map(([key, p]) => ({ source_key: key, name: p.name, specialty: p.specialty })), {
          onConflict: 'source_key',
        })
        .select('id, source_key'),
      'provider upsert',
    );
    for (const row of saved) providerIds.set(row.source_key!, row.id);
  }

  // Lien details aren't in Clio; an existing lien_type is left as it is.
  const links = [
    ...new Map(
      providers.map((p) => {
        const link = { firm_id: firmId, matter_id: matterIds.get(p.clioMatterId)!, provider_id: providerIds.get(keyOf(p))! };
        return [`${link.matter_id}:${link.provider_id}`, link] as const;
      }),
    ).values(),
  ];
  for (const part of chunk(links)) {
    check(
      await db.from('matter_providers').upsert(part, { onConflict: 'matter_id,provider_id', ignoreDuplicates: true }),
      'matter provider upsert',
    );
  }
  return links.length;
}

/** Contacts and costs have no Clio key and are fully derived, so they are replaced. */
async function clearDerived(
  db: ServiceClient,
  table: 'client_contacts' | 'costs',
  firmId: number,
  matterIds: number[],
): Promise<void> {
  for (const part of chunk(matterIds)) {
    check(await db.from(table).delete().eq('firm_id', firmId).in('matter_id', part), `${table} delete`);
  }
}

async function runSync(): Promise<SyncResult> {
  const db = requireSupabase();
  const me = await getWhoAmI();
  const firmId = await upsertFirm(db, me.account);

  // One resource at a time keeps the sync inside Clio's rate limit.
  const matters = await listMatters();
  const notes = await listNotes();
  const communications = await listCommunications();
  const tasks = await listTasks();
  const documents = await listDocuments();
  const calendarEntries = await listCalendarEntries();
  const expenses = await listExpenses();
  const relationships = await listRelationships();

  // matters.client_id is required, so a matter with no client is skipped.
  const withClient = matters.filter((m) => m.client);
  const clientIds = await upsertClients(db, firmId, withClient);
  const matterIds = await upsertMatters(db, firmId, withClient, clientIds);
  const clientContactOf = new Map(withClient.map((m) => [m.id, m.client!.id]));
  const providerCount = await upsertProviders(
    db,
    firmId,
    me.account.id,
    matterIds,
    relationships.flatMap((rel) => {
      const provider = rel.matter && matterIds.has(rel.matter.id) ? providerFromRelationship(rel) : null;
      return provider ? [provider] : [];
    }),
  );

  // Records for matters outside this sync (closed, or skipped) are ignored.
  const inScope = (ref: { id: number } | null | undefined): ref is { id: number } =>
    !!ref && matterIds.has(ref.id);
  const records: SourcedRecord[] = [];
  let tasksWithoutDueDate = 0;
  for (const note of notes) if (inScope(note.matter)) records.push(fromNote(note, note.matter.id));
  for (const comm of communications) {
    if (inScope(comm.matter)) {
      records.push(fromCommunication(comm, comm.matter.id, clientContactOf.get(comm.matter.id) ?? null));
    }
  }
  for (const task of tasks) {
    if (!inScope(task.matter)) continue;
    const record = fromTask(task, task.matter.id);
    if (record) records.push(record);
    else tasksWithoutDueDate++;
  }
  for (const doc of documents) if (inScope(doc.matter)) records.push(fromDocument(doc, doc.matter.id));
  for (const entry of calendarEntries) {
    const record = inScope(entry.matter) ? fromCalendarEntry(entry, entry.matter.id) : null;
    if (record) records.push(record);
  }
  for (const expense of expenses) {
    if (inScope(expense.matter)) records.push(fromExpense(expense, expense.matter.id));
  }

  const citationIds = await upsertSources(db, firmId, matterIds, records);
  const base = (r: SourcedRecord) => ({
    firm_id: firmId,
    matter_id: matterIds.get(r.clioMatterId)!,
    citation_id: citationIds.get(r.key)!,
  });

  const entryRows = records.flatMap((r) =>
    r.entry
      ? [{ ...base(r), kind: r.entry.kind, summary: r.entry.summary, occurred_at: r.entry.occurredAt, clio_id: r.key }]
      : [],
  );
  const taskRows = records.flatMap((r) =>
    r.task
      ? [{ ...base(r), title: r.task.title, due_at: r.task.dueAt, completed_at: r.task.completedAt, clio_task_id: r.task.clioTaskId }]
      : [],
  );
  const contactRows = records.flatMap((r) =>
    r.contact ? [{ ...base(r), occurred_at: r.contact.occurredAt, channel: r.contact.channel }] : [],
  );
  const costRows = records.flatMap((r) =>
    r.cost
      ? [{ ...base(r), amount: r.cost.amount, incurred_on: r.cost.incurredOn, description: r.cost.description }]
      : [],
  );

  for (const part of chunk(entryRows)) {
    check(await db.from('matter_entries').upsert(part, { onConflict: 'firm_id,clio_id' }), 'entry upsert');
  }
  for (const part of chunk(taskRows)) {
    check(await db.from('tasks').upsert(part, { onConflict: 'firm_id,clio_task_id' }), 'task upsert');
  }
  const syncedMatterIds = [...matterIds.values()];
  await clearDerived(db, 'client_contacts', firmId, syncedMatterIds);
  for (const part of chunk(contactRows)) {
    check(await db.from('client_contacts').insert(part), 'contact insert');
  }
  await clearDerived(db, 'costs', firmId, syncedMatterIds);
  for (const part of chunk(costRows)) {
    check(await db.from('costs').insert(part), 'cost insert');
  }

  // Rewrite briefs whose records changed; the sync doesn't wait for them.
  void refreshStaleBriefs(firmId, syncedMatterIds);

  return {
    finishedAt: new Date().toISOString(),
    counts: {
      matters: matterIds.size,
      providers: providerCount,
      clients: clientIds.size,
      documents: records.length,
      entries: entryRows.length,
      tasks: taskRows.length,
      contacts: contactRows.length,
      costs: costRows.length,
    },
    skipped: {
      mattersWithoutClient: matters.length - withClient.length,
      tasksWithoutDueDate,
    },
  };
}

let running: Promise<SyncResult> | null = null;
let last: SyncResult | null = null;
let lastError: string | null = null;

/** Runs a sync, or joins the one already running. */
export function syncClio(): Promise<SyncResult> {
  running ??= runSync()
    .then((result) => {
      last = result;
      lastError = null;
      return result;
    })
    .catch((error: unknown) => {
      // Keep only a safe message: upstream errors can echo record content.
      lastError = error instanceof HttpError ? error.message : 'The last sync failed. Check the server log.';
      console.error(`Clio sync failed: ${error instanceof Error ? error.name : 'error'}`);
      throw error;
    })
    .finally(() => {
      running = null;
    });
  return running;
}

export function getSyncStatus(): SyncStatus {
  return { running: running !== null, last, error: lastError };
}
