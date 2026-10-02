import type { Database } from '../../src/types/database';
import type {
  ClioCalendarEntry,
  ClioCommunication,
  ClioDocument,
  ClioExpense,
  ClioMatter,
  ClioNote,
  ClioTask,
} from '../clio/resources.ts';
import { env } from '../env.ts';

// Pure mapping from Clio records to rows. No I/O, so the rules for stages,
// kinds and excerpts live in one place.

type Enums = Database['public']['Enums'];
export type MatterStage = Enums['matter_stage'];
export type SourceKind = Enums['source_kind'];
export type EntryKind = Enums['entry_kind'];

const EXCERPT_MAX = 500;
const SUMMARY_MAX = 140;

/** Strips HTML (email bodies), collapses whitespace and caps the length. */
export function clip(text: string | null | undefined, max: number): string {
  const plain = (text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain;
}

const excerptOf = (text: string | null | undefined, fallback: string) =>
  clip(text, EXCERPT_MAX) || fallback;

const summaryOf = (text: string | null | undefined, fallback: string) =>
  clip(text, SUMMARY_MAX) || fallback;

/** Clio sends dates (`2026-03-01`) and datetimes; store both as ISO instants. */
export const toIso = (value: string) => new Date(value).toISOString();

const STAGE_KEYWORDS: readonly [RegExp, MatterStage][] = [
  [/settl|closed|resolved/i, 'settled'],
  [/litig|suit|trial|court/i, 'litigation'],
  [/negot|offer/i, 'negotiation'],
  [/demand/i, 'demand'],
  [/treat|medical/i, 'treatment'],
  [/intake|new|open/i, 'intake'],
];

/** Clio's matter stage name, matched by keyword; falls back on the matter status. */
export function stageFor(matter: ClioMatter): MatterStage {
  const name = matter.matter_stage?.name ?? '';
  const match = STAGE_KEYWORDS.find(([pattern]) => pattern.test(name));
  if (match) return match[1];
  return matter.status === 'Closed' ? 'settled' : 'intake';
}

export const sourceUrl = (clioMatterId: number) =>
  new URL(`/nc/#/matters/${clioMatterId}`, env.CLIO_BASE_URL).toString();

// First match wins, so the most specific kinds come first: "bill of
// particulars" is a pleading, and an itemized medical bill is a bill.
const DOCUMENT_KEYWORDS: readonly [RegExp, SourceKind][] = [
  [/pleading|complaint|summons|motion|subpoena|particulars|affirmative|answer|discovery|petition|court|judge|filing/i, 'filing'],
  [/bill|invoice|statement|lien|ledger/i, 'bill'],
  [/medical|mri|x-?ray|physician|therapy|chiro|treatment|diagnos|record/i, 'medical_record'],
  [/policy|declaration|insurance|coverage/i, 'policy'],
  [/intake|hipaa|photo-?id/i, 'intake_form'],
  [/memo|valuation/i, 'memo'],
  [/letter|demand|correspondence/i, 'letter'],
  [/police|report|photo|estimate|expert/i, 'report'],
];

export function documentKindFor(document: ClioDocument): SourceKind {
  const text = `${document.document_category?.name ?? ''} ${document.name}`;
  return DOCUMENT_KEYWORDS.find(([pattern]) => pattern.test(text))?.[1] ?? 'report';
}

const COURT_DATE = /court|hearing|trial|deposition|mediation|arbitration|conference/i;

/**
 * One Clio record as the rows it produces. Every record becomes a document
 * with one citation (what a source chip opens); some also become an entry
 * in the record, a task, a client contact or a cost.
 */
export interface SourcedRecord {
  /** Stable synthetic id: `documents.clio_document_id` and `matter_entries.clio_id`. */
  key: string;
  clioMatterId: number;
  document: { kind: SourceKind; title: string; date: string; author: string | null };
  excerpt: string;
  entry: { kind: EntryKind; summary: string; occurredAt: string } | null;
  task?: { clioTaskId: string; title: string; dueAt: string; completedAt: string | null };
  contact?: { occurredAt: string; channel: string };
  cost?: { amount: number; incurredOn: string; description: string };
}

export function fromNote(note: ClioNote, clioMatterId: number): SourcedRecord {
  const date = toIso(note.date ?? note.created_at);
  return {
    key: `note:${note.id}`,
    clioMatterId,
    document: { kind: 'note', title: summaryOf(note.subject, 'Note'), date, author: note.author?.name ?? null },
    excerpt: excerptOf(note.detail, note.subject ?? 'Note with no text'),
    entry: { kind: 'note', summary: summaryOf(note.subject ?? note.detail, 'Note added'), occurredAt: date },
  };
}

const involves = (comm: ClioCommunication, contactId: number | null) =>
  contactId !== null && [...comm.senders, ...comm.receivers].some((p) => p.id === contactId);

export function fromCommunication(
  comm: ClioCommunication,
  clioMatterId: number,
  clientContactId: number | null,
): SourcedRecord {
  const date = toIso(comm.date ?? comm.created_at);
  const isPhone = comm.type === 'PhoneCommunication';
  const fromClient = clientContactId !== null && comm.senders.some((p) => p.id === clientContactId);
  const label = isPhone ? 'Phone call' : 'Email';
  const subject = summaryOf(comm.subject, label);
  return {
    key: `comm:${comm.id}`,
    clioMatterId,
    document: {
      kind: isPhone ? 'call_log' : 'email',
      title: subject,
      date,
      author: comm.senders[0]?.name ?? null,
    },
    excerpt: excerptOf(comm.body, subject),
    entry: {
      kind: isPhone ? 'note' : fromClient ? 'client_message' : 'email',
      summary: isPhone ? `Call: ${subject}` : subject,
      occurredAt: date,
    },
    contact: involves(comm, clientContactId) ? { occurredAt: date, channel: label } : undefined,
  };
}

/** Null when the task has no due date: `tasks.due_at` is required. */
export function fromTask(task: ClioTask, clioMatterId: number): SourcedRecord | null {
  if (!task.due_at) return null;
  return {
    key: `task:${task.id}`,
    clioMatterId,
    document: { kind: 'task', title: summaryOf(`Task: ${task.name}`, 'Task'), date: toIso(task.created_at), author: null },
    excerpt: excerptOf(task.description, `Task in Clio: ${task.name}`),
    entry: null,
    task: {
      clioTaskId: String(task.id),
      title: summaryOf(task.name, 'Task'),
      dueAt: toIso(task.due_at),
      completedAt: task.status === 'complete' ? toIso(task.completed_at ?? task.due_at) : null,
    },
  };
}

export function fromDocument(document: ClioDocument, clioMatterId: number): SourcedRecord {
  const date = toIso(document.created_at);
  const title = summaryOf(document.name, 'Document');
  return {
    key: `doc:${document.id}`,
    clioMatterId,
    document: { kind: documentKindFor(document), title, date, author: null },
    // The file itself isn't downloaded yet, so the excerpt names it.
    excerpt: `Document in Clio: ${title}`,
    entry: { kind: 'document', summary: `Document added: ${title}`, occurredAt: date },
  };
}

/** Only court dates enter the record; other calendar entries are skipped. */
export function fromCalendarEntry(entry: ClioCalendarEntry, clioMatterId: number): SourcedRecord | null {
  const text = `${entry.summary ?? ''} ${entry.description ?? ''}`;
  if (!COURT_DATE.test(text)) return null;
  const date = toIso(entry.start_at);
  const summary = summaryOf(entry.summary, 'Court date');
  return {
    key: `cal:${entry.id}`,
    clioMatterId,
    document: { kind: 'filing', title: summary, date, author: null },
    excerpt: excerptOf(entry.description, summary),
    entry: { kind: 'court_date', summary, occurredAt: date },
  };
}

export function fromExpense(expense: ClioExpense, clioMatterId: number): SourcedRecord {
  const description = summaryOf(expense.note, 'Expense');
  // Billed or not, the firm advanced it.
  const amount = expense.total ?? expense.non_billable_total ?? expense.price * expense.quantity;
  return {
    key: `exp:${expense.id}`,
    clioMatterId,
    document: { kind: 'ledger', title: `Expense: ${description}`, date: toIso(expense.date), author: null },
    excerpt: `${description}: $${amount.toFixed(2)}`,
    entry: null,
    cost: { amount, incurredOn: expense.date.slice(0, 10), description },
  };
}
