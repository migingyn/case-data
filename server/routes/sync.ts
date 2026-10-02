import { Router } from 'express';
import { getSyncStatus, syncClio } from '../sync/syncClio.ts';

export const syncRouter = Router();

/** Runs a full Clio sync and returns the counts. Joins a sync already running. */
syncRouter.post('/', async (_req, res) => {
  res.json(await syncClio());
});

syncRouter.get('/status', (_req, res) => {
  res.json(getSyncStatus());
});
