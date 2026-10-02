import { Router } from 'express';
import { HttpError } from '../errors.ts';
import { getCurrentFirm } from '../matters/firm.ts';
import { readDashboard } from '../matters/readDashboard.ts';
import { readMatterDetail } from '../matters/readMatterDetail.ts';
import { requireSupabase } from '../supabase.ts';

// Reads with the service role until the app has sign-in; then the browser
// reads through RLS and these routes go away.
export const mattersRouter = Router();

mattersRouter.get('/', async (_req, res) => {
  const db = requireSupabase();
  const firm = await getCurrentFirm(db);
  res.json({ matters: firm ? await readDashboard(db, firm.id) : [] });
});

mattersRouter.get('/:id', async (req, res) => {
  const matterId = Number(req.params.id);
  if (!Number.isSafeInteger(matterId)) throw new HttpError(404, 'Matter not found.');
  const db = requireSupabase();
  const firm = await getCurrentFirm(db);
  const detail = firm ? await readMatterDetail(db, firm.id, matterId) : null;
  if (!detail) throw new HttpError(404, 'Matter not found.');
  res.json(detail);
});

export const firmRouter = Router();

firmRouter.get('/', async (_req, res) => {
  const firm = await getCurrentFirm(requireSupabase());
  if (!firm) throw new HttpError(404, 'No firm yet. Connect Clio and sync.');
  res.json({ name: firm.name });
});
