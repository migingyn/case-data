import { matterDetailSchema, type MatterDetail } from '../../src/types/matters';
import { unwrap, unwrapMaybe, type ServiceClient } from '../supabase.ts';
import { iso, loadSources, sourceOf } from './shared.ts';

/**
 * Header facts, KPIs and side panels for one matter, or null if the firm has
 * no such matter. The brief, ranked entries, injuries and provider data stay
 * empty until the AI summary and provider records exist.
 */
export async function readMatterDetail(
  db: ServiceClient,
  firmId: number,
  matterId: number,
): Promise<MatterDetail | null> {
  const matter = unwrapMaybe(
    await db
      .from('matters')
      .select('id, client_id, opened_on, lead_attorney_name, source_url, paused_reason')
      .eq('firm_id', firmId)
      .eq('id', matterId)
      .maybeSingle(),
    'matter read',
  );
  if (!matter) return null;

  const [client, valuation, policy, costs, contact, entryCount, summary] = await Promise.all([
    db.from('clients').select('full_name').eq('id', matter.client_id).single(),
    db
      .from('valuations')
      .select('expected_amount, low_amount, high_amount, valued_at, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('valued_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('policies')
      .select('carrier, policy_type, limit_amount, verified_at, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('verified_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('costs')
      .select('amount, incurred_on, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('incurred_on', { ascending: false }),
    db
      .from('client_contacts')
      .select('occurred_at, channel, citation_id')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('matter_entries')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', firmId)
      .eq('matter_id', matterId),
    db
      .from('matter_summaries')
      .select('generated_at')
      .eq('firm_id', firmId)
      .eq('matter_id', matterId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const clientRow = unwrap(client, 'client read');
  const valuationRow = unwrapMaybe(valuation, 'valuation read');
  const policyRow = unwrapMaybe(policy, 'policy read');
  const costRows = unwrap(costs, 'cost read');
  const contactRow = unwrapMaybe(contact, 'contact read');
  const summaryRow = unwrapMaybe(summary, 'summary read');
  if (entryCount.error) throw new Error(`Supabase entry count failed: ${entryCount.error.message}`);

  // The newest cost stands in as the source for the spend total.
  const latestCost = costRows[0];
  const sources = await loadSources(
    db,
    [valuationRow, policyRow, latestCost, contactRow].flatMap((row) => (row ? [row.citation_id] : [])),
  );

  const detail: MatterDetail = {
    matterId: String(matter.id),
    photoUrl: null,
    openedAt: iso(matter.opened_on),
    openedSource: null,
    leadAttorney: matter.lead_attorney_name,
    sourceUrl: matter.source_url,
    caseValue: valuationRow && {
      expected: Math.round(valuationRow.expected_amount),
      low: Math.round(valuationRow.low_amount),
      high: Math.round(valuationRow.high_amount),
      updatedAt: iso(valuationRow.valued_at),
      source: sourceOf(sources, valuationRow.citation_id),
    },
    coverage: policyRow && {
      limit: Math.round(policyRow.limit_amount),
      carrier: policyRow.carrier,
      type: policyRow.policy_type,
      verifiedAt: iso(policyRow.verified_at),
      source: sourceOf(sources, policyRow.citation_id),
    },
    firmSpend: latestCost
      ? {
          amount: Math.round(costRows.reduce((sum, cost) => sum + cost.amount, 0)),
          asOf: iso(latestCost.incurred_on),
          source: sourceOf(sources, latestCost.citation_id),
        }
      : null,
    lastContact: contactRow && {
      at: iso(contactRow.occurred_at),
      who: clientRow.full_name,
      channel: contactRow.channel,
      source: sourceOf(sources, contactRow.citation_id),
    },
    summaryAsOf: summaryRow ? iso(summaryRow.generated_at) : null,
    brief: { whereItStands: [], whatIsNext: [], watchFor: [] },
    rankedEntries: [],
    totalEntries: entryCount.count ?? 0,
    injuries: [],
    providers: [],
    milestones: [],
    visits: [],
    requests: [],
    documents: [],
    providerSummary: [],
    pausedReason: matter.paused_reason,
  };
  return matterDetailSchema.parse(detail);
}
