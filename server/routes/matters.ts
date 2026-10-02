import { Router } from 'express';
import { briefStatus, startBrief } from '../briefs/briefs.ts';
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

const parseMatterId = (raw: string) => {
  const matterId = Number(raw);
  if (!Number.isSafeInteger(matterId)) throw new HttpError(404, 'Matter not found.');
  return matterId;
};

mattersRouter.get('/:id', async (req, res) => {
  const matterId = parseMatterId(req.params.id);
  const db = requireSupabase();
  const firm = await getCurrentFirm(db);
  const detail = firm ? await readMatterDetail(db, firm.id, matterId) : null;
  if (!firm || !detail) throw new HttpError(404, 'Matter not found.');
  // The only read that can call the model: the first open of a matter with
  // no brief. After a failure it waits for an explicit retry.
  if (detail.summaryAsOf === null && briefStatus(matterId) === 'idle') {
    startBrief(firm.id, matterId);
    const status = briefStatus(matterId);
    res.json({ ...detail, briefStatus: status === 'idle' ? 'ready' : status });
    return;
  }
  res.json(detail);
});

/** Regenerate: writes a fresh brief in the background. */
mattersRouter.post('/:id/brief', async (req, res) => {
  const matterId = parseMatterId(req.params.id);
  const db = requireSupabase();
  const firm = await getCurrentFirm(db);
  const detail = firm ? await readMatterDetail(db, firm.id, matterId) : null;
  if (!firm || !detail) throw new HttpError(404, 'Matter not found.');
  startBrief(firm.id, matterId);
  res.status(202).end();
});

export const firmRouter = Router();

firmRouter.get('/', async (_req, res) => {
  const firm = await getCurrentFirm(requireSupabase());
  if (!firm) throw new HttpError(404, 'No firm yet. Connect Clio and sync.');
  res.json({ name: firm.name });
});
