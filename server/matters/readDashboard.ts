import { z } from 'zod';
import { matterSchema, type Matter } from '../../src/types/matters';
import { unwrap, type ServiceClient } from '../supabase.ts';
import { inChunks, iso, latestByMatter, loadSources, sourceOf, uiStage } from './shared.ts';

const DAY_MS = 86_400_000;
/** How far back the dashboard's "What changed" can look. */
const ACTIVITY_WINDOW_DAYS = 90;

/** Every matter of the firm with recent activity and open tasks, for My matters. */
export async function readDashboard(db: ServiceClient, firmId: number): Promise<Matter[]> {
  const matters = unwrap(
    await db.from('matters').select('id, client_id, case_type, stage').eq('firm_id', firmId).order('opened_on'),
    'matter read',
  );
  if (matters.length === 0) return [];
  const matterIds = matters.map((m) => m.id);

  const now = new Date();
  const since = new Date(now.getTime() - ACTIVITY_WINDOW_DAYS * DAY_MS);

  const clientIds = [...new Set(matters.map((m) => m.client_id))];
  const [clients, entries, tasks, contacts, valuations, policies] = await Promise.all([
    inChunks(clientIds, async (ids) =>
      unwrap(await db.from('clients').select('id, full_name').eq('firm_id', firmId).in('id', ids), 'client read'),
    ),
    inChunks(matterIds, async (ids) =>
      unwrap(
        await db
          .from('matter_entries')
          .select('id, matter_id, kind, summary, occurred_at, citation_id')
          .eq('firm_id', firmId)
          .in('matter_id', ids)
          .gte('occurred_at', since.toISOString())
          // Future-dated entries (an upcoming hearing) haven't happened yet.
          .lte('occurred_at', now.toISOString())
          .order('occurred_at', { ascending: false }),
        'entry read',
      ),
    ),
    inChunks(matterIds, async (ids) =>
      unwrap(
        await db
          .from('tasks')
          .select('id, matter_id, title, due_at, waiting_on, citation_id')
          .eq('firm_id', firmId)
          .in('matter_id', ids)
          .is('completed_at', null),
        'task read',
      ),
    ),
    inChunks(matterIds, async (ids) =>
      unwrap(
        await db
          .from('client_contacts')
          .select('matter_id, occurred_at')
          .eq('firm_id', firmId)
          .in('matter_id', ids)
          .order('occurred_at', { ascending: false }),
        'contact read',
      ),
    ),
    inChunks(matterIds, async (ids) =>
      unwrap(
        await db
          .from('valuations')
          .select('matter_id, expected_amount')
          .eq('firm_id', firmId)
          .in('matter_id', ids)
          .order('valued_at', { ascending: false }),
        'valuation read',
      ),
    ),
    inChunks(matterIds, async (ids) =>
      unwrap(
        await db
          .from('policies')
          .select('matter_id, limit_amount')
          .eq('firm_id', firmId)
          .in('matter_id', ids)
          .order('verified_at', { ascending: false }),
        'policy read',
      ),
    ),
  ]);

  const sources = await loadSources(db, [...entries.map((e) => e.citation_id), ...tasks.map((t) => t.citation_id)]);
  const clientName = new Map(clients.map((c) => [c.id, c.full_name]));
  const lastContact = latestByMatter(contacts);
  const latestValuation = latestByMatter(valuations);
  const latestPolicy = latestByMatter(policies);

  const result = matters.map((m) => {
    const valuation = latestValuation.get(m.id);
    const policy = latestPolicy.get(m.id);
    const contact = lastContact.get(m.id);
    return {
      id: String(m.id),
      clientName: clientName.get(m.client_id) ?? 'Unknown client',
      caseType: m.case_type,
      stage: uiStage(m.stage),
      lastClientContactAt: contact ? iso(contact.occurred_at) : null,
      estimatedValue: valuation ? Math.round(valuation.expected_amount) : null,
      coverageLimit: policy ? Math.round(policy.limit_amount) : null,
      activity: entries
        .filter((e) => e.matter_id === m.id)
        .map((e) => ({
          id: String(e.id),
          kind: e.kind,
          summary: e.summary,
          occurredAt: iso(e.occurred_at),
          source: sourceOf(sources, e.citation_id),
        })),
      tasks: tasks
        .filter((t) => t.matter_id === m.id)
        .map((t) => ({
          id: String(t.id),
          title: t.title,
          dueAt: iso(t.due_at),
          done: false,
          waitingOn: t.waiting_on,
          source: sourceOf(sources, t.citation_id),
        })),
    };
  });
  // Parse at the boundary so drift fails here, not as undefined in the UI.
  return z.array(matterSchema).parse(result);
}
