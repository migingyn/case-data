import { matterStages, type Activity, type ActivityKind, type Matter, type Task } from '@/types/matters';

const DAY_MS = 86_400_000;

/** Days without client contact before a matter counts as a contact gap. */
export const CONTACT_GAP_DAYS = 14;

/** Most important first: what the "What changed" column leads with. */
const KIND_PRIORITY: readonly ActivityKind[] = [
  'offer',
  'court_date',
  'client_message',
  'provider_reply',
  'document',
  'email',
  'note',
];

export function daysSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - Date.parse(iso)) / DAY_MS));
}

export function isOverdue(task: Task, now: number): boolean {
  return !task.done && Date.parse(task.dueAt) < now;
}

/** Activity after `since`, most important first, then most recent. */
export function newActivity(matter: Matter, since: number): Activity[] {
  return matter.activity
    .filter((item) => Date.parse(item.occurredAt) > since)
    .sort(
      (a, b) =>
        KIND_PRIORITY.indexOf(a.kind) - KIND_PRIORITY.indexOf(b.kind) ||
        Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    );
}

export interface MatterSummary {
  matter: Matter;
  newItems: Activity[];
  nextTask: Task | null;
  overdueTasks: Task[];
  contactDays: number;
  hasContactGap: boolean;
}

/**
 * Derives everything the dashboard shows for one matter.
 * `seenAt` is the later of the user's last visit and when they last opened
 * this matter, so an opened matter reads "No change" until newer activity.
 */
export function summarizeMatter(matter: Matter, seenAt: number, now: number): MatterSummary {
  const openTasks = matter.tasks
    .filter((task) => !task.done)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  const contactDays = daysSince(matter.lastClientContactAt, now);
  return {
    matter,
    newItems: newActivity(matter, seenAt),
    nextTask: openTasks[0] ?? null,
    overdueTasks: openTasks.filter((task) => isOverdue(task, now)),
    contactDays,
    hasContactGap: contactDays > CONTACT_GAP_DAYS,
  };
}

const countKind = (summary: MatterSummary, kind: ActivityKind) =>
  summary.newItems.filter((item) => item.kind === kind).length;

/** The four "Since you were last here" counts; each filters the table. */
export const sinceFilters = {
  changed: {
    label: 'Matters changed',
    count: (s: MatterSummary) => (s.newItems.length > 0 ? 1 : 0),
  },
  messages: {
    label: 'New client messages',
    count: (s: MatterSummary) => countKind(s, 'client_message'),
  },
  providers: {
    label: 'Provider requests answered',
    count: (s: MatterSummary) => countKind(s, 'provider_reply'),
  },
  overdue: {
    label: 'Overdue tasks',
    count: (s: MatterSummary) => s.overdueTasks.length,
  },
} as const;

export type SinceFilter = keyof typeof sinceFilters;

export function isSinceFilter(value: string | null): value is SinceFilter {
  return value !== null && value in sinceFilters;
}

/** Matches from the start of any word, so "truck" doesn't hit "struck". */
export function matchesSearch(matter: Matter, query: string): boolean {
  const needle = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!needle) return true;
  const words = (text: string) => ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ')}`;
  return [matter.clientName, matter.caseType].some((text) => words(text).includes(` ${needle}`));
}

export type SortKey = 'matter' | 'stage' | 'changed' | 'deadline' | 'contact' | 'value';
export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const deadlineTime = (s: MatterSummary) =>
  s.nextTask ? Date.parse(s.nextTask.dueAt) : Number.POSITIVE_INFINITY;

const sortValue: Record<SortKey, (s: MatterSummary) => number | string> = {
  matter: (s) => s.matter.clientName,
  stage: (s) => matterStages.indexOf(s.matter.stage),
  changed: (s) => s.newItems.length,
  deadline: deadlineTime,
  contact: (s) => s.contactDays,
  value: (s) => s.matter.estimatedValue,
};

function compareValues(a: number | string, b: number | string): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Default order: matters with new items first, then soonest deadline. */
function compareDefault(a: MatterSummary, b: MatterSummary): number {
  const aNew = a.newItems.length > 0 ? 0 : 1;
  const bNew = b.newItems.length > 0 ? 0 : 1;
  return aNew - bNew || compareValues(deadlineTime(a), deadlineTime(b));
}

export function sortSummaries(summaries: MatterSummary[], sort: SortState | null): MatterSummary[] {
  const sorted = [...summaries];
  if (!sort) return sorted.sort(compareDefault);
  const sign = sort.direction === 'asc' ? 1 : -1;
  const value = sortValue[sort.key];
  return sorted.sort((a, b) => sign * compareValues(value(a), value(b)) || compareDefault(a, b));
}

export interface AttentionItem {
  id: string;
  matterId: string;
  title: string;
  detail: string;
}

export interface NeedsYouToday {
  overdue: AttentionItem[];
  waiting: AttentionItem[];
  contactGaps: AttentionItem[];
}

const dayCount = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/** Groups for the "Needs you today" rail. Each task lands in one group. */
export function needsYouToday(summaries: MatterSummary[], now: number): NeedsYouToday {
  const result: NeedsYouToday = { overdue: [], waiting: [], contactGaps: [] };
  for (const s of summaries) {
    const { matter } = s;
    for (const task of s.overdueTasks) {
      result.overdue.push({
        id: task.id,
        matterId: matter.id,
        title: task.title,
        detail: `${matter.clientName} · ${dayCount(daysSince(task.dueAt, now) || 1)} overdue`,
      });
    }
    for (const task of matter.tasks) {
      if (task.done || !task.waitingOn || isOverdue(task, now)) continue;
      result.waiting.push({
        id: task.id,
        matterId: matter.id,
        title: task.title,
        detail: `${task.waitingOn} · ${matter.clientName}`,
      });
    }
  }
  result.contactGaps = summaries
    .filter((s) => s.hasContactGap)
    .sort((a, b) => b.contactDays - a.contactDays)
    .map((s) => ({
      id: `gap-${s.matter.id}`,
      matterId: s.matter.id,
      title: s.matter.clientName,
      detail: `No contact in ${dayCount(s.contactDays)}`,
    }));
  return result;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (dollars: number) => currency.format(dollars);

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));

/** "Today", "Tomorrow", "In 3 days", "2 days overdue". */
export function formatDue(iso: string, now: number): string {
  const days = Math.round((Date.parse(iso) - now) / DAY_MS);
  if (Date.parse(iso) < now) return `${dayCount(Math.max(1, -days))} overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  return `${dayCount(days)} ago`;
}

export interface TaskGroups {
  overdue: Task[];
  comingUp: Task[];
  waiting: Task[];
}

/** Open tasks split for the matter view. Each task lands in one group. */
export function groupTasks(tasks: Task[], now: number): TaskGroups {
  const open = tasks
    .filter((task) => !task.done)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  return {
    overdue: open.filter((task) => isOverdue(task, now)),
    comingUp: open.filter((task) => !isOverdue(task, now) && !task.waitingOn),
    waiting: open.filter((task) => !isOverdue(task, now) && task.waitingOn),
  };
}

/** "Maria Alvarez" → "MA". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatLongDate = (iso: string) => longDate.format(new Date(iso));

const timeOfDay = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDateTime = (iso: string) => timeOfDay.format(new Date(iso));
