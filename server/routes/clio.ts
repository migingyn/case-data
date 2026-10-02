import { Router } from 'express';
import { ClioNotConnectedError, getWhoAmI, listMatters } from '../clio/client.ts';
import {
  buildAuthorizeUrl,
  consumeState,
  createState,
  deauthorize,
  exchangeCode,
  isClioConfigured,
} from '../clio/oauth.ts';
import { clearTokens, getTokens, saveTokens } from '../clio/tokenStore.ts';

const INTEGRATIONS_PAGE = '/app/integrations';
const SMOKE_TEST_MATTER_LIMIT = 10;

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

clioRouter.get('/matters', async (_req, res) => {
  res.json(await listMatters(SMOKE_TEST_MATTER_LIMIT));
});

clioRouter.post('/disconnect', async (_req, res) => {
  const tokens = await getTokens();
  if (tokens) await deauthorize(tokens.accessToken);
  await clearTokens();
  res.status(204).end();
});
