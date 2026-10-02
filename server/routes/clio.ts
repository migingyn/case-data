import { Router } from 'express';
import { ClioNotConnectedError, getWhoAmI } from '../clio/client.ts';
import {
  buildAuthorizeUrl,
  consumeState,
  createState,
  deauthorize,
  exchangeCode,
  isClioConfigured,
} from '../clio/oauth.ts';
import { clearTokens, getTokens, saveTokens } from '../clio/tokenStore.ts';
import { syncClio } from '../sync/syncClio.ts';

const INTEGRATIONS_PAGE = '/app/integrations';

export const clioRouter = Router();

clioRouter.get('/connect', (_req, res) => {
  res.redirect(buildAuthorizeUrl(createState()));
});

clioRouter.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (typeof code !== 'string' || typeof state !== 'string' || !consumeState(state)) {
    res.redirect(`${INTEGRATIONS_PAGE}?clio=error`);
    return;
  }
  try {
    await saveTokens(await exchangeCode(code));
    // Pull the firm's matters right away; the page shows progress via /api/sync/status.
    syncClio().catch(() => undefined);
    res.redirect(`${INTEGRATIONS_PAGE}?clio=connected`);
  } catch {
    res.redirect(`${INTEGRATIONS_PAGE}?clio=error`);
  }
});

clioRouter.get('/status', async (_req, res) => {
  if (!isClioConfigured()) {
    res.json({ configured: false, connected: false, user: null });
    return;
  }
  try {
    const user = await getWhoAmI();
    res.json({ configured: true, connected: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    if (!(error instanceof ClioNotConnectedError)) throw error;
    res.json({ configured: true, connected: false, user: null });
  }
});

clioRouter.post('/disconnect', async (_req, res) => {
  const tokens = await getTokens();
  if (tokens) await deauthorize(tokens.accessToken);
  await clearTokens();
  res.status(204).end();
});
