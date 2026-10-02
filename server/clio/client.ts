import { z } from 'zod';
import { env } from '../env.ts';
import { HttpError } from '../errors.ts';
import { refreshTokens } from './oauth.ts';
import { clearTokens, getTokens, saveTokens, type ClioTokens } from './tokenStore.ts';

// Refresh a little early so a request never races the expiry.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export class ClioNotConnectedError extends HttpError {
  constructor() {
    super(409, 'Clio is not connected.');
  }
}

async function currentTokens(): Promise<ClioTokens> {
  const tokens = await getTokens();
  if (!tokens) throw new ClioNotConnectedError();
  if (tokens.expiresAt - Date.now() > REFRESH_MARGIN_MS) return tokens;
  return renew(tokens);
}

async function renew(tokens: ClioTokens): Promise<ClioTokens> {
  try {
    const renewed = await refreshTokens(tokens.refreshToken);
    await saveTokens(renewed);
    return renewed;
  } catch {
    // A refresh token Clio rejects is dead; make the user connect again.
    await clearTokens();
    throw new ClioNotConnectedError();
  }
}

/** GET a Clio v4 API path, e.g. `/matters.json`, refreshing the token as needed. */
export async function clioGet(apiPath: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(`/api/v4${apiPath}`, env.CLIO_BASE_URL);
  url.search = new URLSearchParams(params).toString();

  const send = (tokens: ClioTokens) =>
    fetch(url, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });

  const tokens = await currentTokens();
  let response = await send(tokens);
  if (response.status === 401) response = await send(await renew(tokens));
  if (!response.ok) throw new HttpError(502, `Clio request to ${apiPath} failed (${response.status}).`);
  return response.json();
}

const whoAmISchema = z.object({
  data: z.object({ id: z.number(), name: z.string(), email: z.string() }),
});
export type ClioUser = z.infer<typeof whoAmISchema>['data'];

export async function getWhoAmI(): Promise<ClioUser> {
  const body = await clioGet('/users/who_am_i.json', { fields: 'id,name,email' });
  return whoAmISchema.parse(body).data;
}

const mattersSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      display_number: z.string(),
      description: z.string().nullable(),
      status: z.string(),
      client: z.object({ name: z.string() }).nullable(),
    }),
  ),
});

export interface ClioMatterSummary {
  id: number;
  displayNumber: string;
  description: string | null;
  status: string;
  clientName: string | null;
}

export async function listMatters(limit: number): Promise<ClioMatterSummary[]> {
  const body = await clioGet('/matters.json', {
    fields: 'id,display_number,description,status,client{name}',
    limit: String(limit),
  });
  return mattersSchema.parse(body).data.map((matter) => ({
    id: matter.id,
    displayNumber: matter.display_number,
    description: matter.description,
    status: matter.status,
    clientName: matter.client?.name ?? null,
  }));
}
