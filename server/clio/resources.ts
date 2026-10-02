import { z } from 'zod';
import { clioGetAll } from './client.ts';

// Bulk fetchers for the sync: one paged call per resource across all
// matters, so a sync costs a handful of requests rather than several per
// matter. Optional Clio fields are nullish because Clio omits or nulls them.

const named = z.object({ name: z.string() });
const matterRef = z.object({ id: z.number() });

const matterSchema = z.object({
  id: z.number(),
  display_number: z.string(),
  description: z.string().nullish(),
  status: z.string(),
  open_date: z.string().nullish(),
  created_at: z.string(),
  practice_area: named.nullish(),
  matter_stage: named.nullish(),
  responsible_attorney: named.nullish(),
  client: z.object({ id: z.number(), name: z.string() }).nullish(),
});
export type ClioMatter = z.infer<typeof matterSchema>;

const noteSchema = z.object({
  id: z.number(),
  subject: z.string().nullish(),
  detail: z.string().nullish(),
  date: z.string().nullish(),
  created_at: z.string(),
  author: named.nullish(),
  matter: matterRef.nullish(),
});
export type ClioNote = z.infer<typeof noteSchema>;

const participantSchema = z.object({ id: z.number(), type: z.string(), name: z.string().nullish() });

const communicationSchema = z.object({
  id: z.number(),
  type: z.string(),
  subject: z.string().nullish(),
  body: z.string().nullish(),
  date: z.string().nullish(),
  created_at: z.string(),
  senders: z.array(participantSchema).default([]),
  receivers: z.array(participantSchema).default([]),
  matter: matterRef.nullish(),
});
export type ClioCommunication = z.infer<typeof communicationSchema>;

const taskSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  due_at: z.string().nullish(),
  status: z.string(),
  completed_at: z.string().nullish(),
  created_at: z.string(),
  matter: matterRef.nullish(),
});
export type ClioTask = z.infer<typeof taskSchema>;

const documentSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  document_category: named.nullish(),
  matter: matterRef.nullish(),
});
export type ClioDocument = z.infer<typeof documentSchema>;

const calendarEntrySchema = z.object({
  // Clio returns calendar entry ids as strings.
  id: z.union([z.string(), z.number()]).transform(String),
  summary: z.string().nullish(),
  description: z.string().nullish(),
  start_at: z.string(),
  matter: matterRef.nullish(),
});
export type ClioCalendarEntry = z.infer<typeof calendarEntrySchema>;

const expenseSchema = z.object({
  id: z.number(),
  // Billable expenses carry `total`; non-billable ones `non_billable_total`.
  total: z.number().nullish(),
  non_billable_total: z.number().nullish(),
  price: z.number(),
  quantity: z.number(),
  date: z.string(),
  note: z.string().nullish(),
  matter: matterRef.nullish(),
});
export type ClioExpense = z.infer<typeof expenseSchema>;

const relationshipSchema = z.object({
  id: z.number(),
  description: z.string().nullish(),
  contact: z.object({ id: z.number(), name: z.string(), type: z.string() }).nullish(),
  matter: matterRef.nullish(),
});
export type ClioRelationship = z.infer<typeof relationshipSchema>;

async function fetchAll<T extends z.ZodType>(
  schema: T,
  apiPath: string,
  params: Record<string, string>,
): Promise<z.infer<T>[]> {
  return z.array(schema).parse(await clioGetAll(apiPath, params));
}

/** Matters the firm is still working: open and pending. */
export const listMatters = () =>
  fetchAll(matterSchema, '/matters.json', {
    status: 'open,pending',
    fields:
      'id,display_number,description,status,open_date,created_at,practice_area{name},matter_stage{name},responsible_attorney{name},client{id,name}',
  });

export const listNotes = () =>
  fetchAll(noteSchema, '/notes.json', {
    type: 'Matter',
    fields: 'id,subject,detail,date,created_at,author{name},matter{id}',
  });

export const listCommunications = () =>
  fetchAll(communicationSchema, '/communications.json', {
    fields: 'id,type,subject,body,date,created_at,senders,receivers,matter{id}',
  });

export const listTasks = () =>
  fetchAll(taskSchema, '/tasks.json', {
    fields: 'id,name,description,due_at,status,completed_at,created_at,matter{id}',
  });

export const listDocuments = () =>
  fetchAll(documentSchema, '/documents.json', {
    fields: 'id,name,created_at,document_category{name},matter{id}',
  });

export const listCalendarEntries = () =>
  fetchAll(calendarEntrySchema, '/calendar_entries.json', {
    fields: 'id,summary,description,start_at,matter{id}',
  });

export const listExpenses = () =>
  fetchAll(expenseSchema, '/activities.json', {
    type: 'ExpenseEntry',
    fields: 'id,total,non_billable_total,price,quantity,date,note,matter{id}',
  });

/** Contacts tied to a matter with a role, e.g. "Treating provider, physical therapy". */
export const listRelationships = () =>
  fetchAll(relationshipSchema, '/relationships.json', {
    fields: 'id,description,contact{id,name,type},matter{id}',
  });
