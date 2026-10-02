import type { Source, SourceKind } from '@/types/sources';

const kindLabels: Record<SourceKind, string> = {
  letter: 'letter',
  email: 'email',
  note: 'note',
  medical_record: 'medical record',
  bill: 'bill',
  policy: 'policy',
  filing: 'filing',
  call_log: 'call log',
  ledger: 'ledger',
  intake_form: 'intake form',
  task: 'task',
  message: 'message',
  memo: 'memo',
  report: 'report',
};

export const sourceKindLabel = (kind: SourceKind) => kindLabels[kind];

const chipDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** "letter, p.4" when the fact is on a page, else "email, Sep 12". */
export function sourceChipLabel(source: Source): string {
  const where = source.page ? `p.${source.page}` : chipDate.format(new Date(source.date));
  return `${kindLabels[source.kind]}, ${where}`;
}
