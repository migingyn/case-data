import { Router } from 'express';
import { env } from '../env.ts';
import { openai, pingModel } from '../openai.ts';

export const aiRouter = Router();

aiRouter.get('/status', (_req, res) => {
  res.json({ configured: openai !== null, model: env.OPENAI_MODEL });
});

aiRouter.post('/ping', async (_req, res) => {
  res.json(await pingModel());
});
