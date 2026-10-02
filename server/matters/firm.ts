import { unwrapMaybe, type ServiceClient } from '../supabase.ts';

export interface CurrentFirm {
  id: number;
  name: string;
}

/**
 * The firm this server serves: the most recent one linked to a Clio account.
 * One firm per deployment until there is sign-in; then this becomes the
 * signed-in member's firm. Null before the first sync.
 */
export async function getCurrentFirm(db: ServiceClient): Promise<CurrentFirm | null> {
  return unwrapMaybe(
    await db
      .from('firms')
      .select('id, name')
      .not('clio_account_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    'firm lookup',
  );
}
