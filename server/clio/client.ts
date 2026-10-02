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

const MAX_RATE_LIMIT_RETRIES = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const apiUrl = (apiPath: string, params: Record<string, string>) => {
  const url = new URL(`/api/v4${apiPath}`, env.CLIO_BASE_URL);
  url.search = new URLSearchParams(params).toString();
  return url;
};

/** Sends one request, waiting out Clio's rate limit (429) a few times. */
async function send(url: URL, tokens: ClioTokens): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
    if (response.status !== 429 || attempt >= MAX_RATE_LIMIT_RETRIES) return response;
    const retryAfterSeconds = Number(response.headers.get('Retry-After')) || 2 ** attempt;
    await sleep(Math.min(retryAfterSeconds, 60) * 1000);
  }
}

async function request(url: URL, apiPath: string): Promise<unknown> {
  const tokens = await currentTokens();
  let response = await send(url, tokens);
  if (response.status === 401) response = await send(url, await renew(tokens));
  if (!response.ok) throw new HttpError(502, `Clio request to ${apiPath} failed (${response.status}).`);
  return response.json();
}

/** GET a Clio v4 API path, e.g. `/matters.json`, refreshing the token as needed. */
export async function clioGet(apiPath: string, params: Record<string, string> = {}): Promise<unknown> {
  return request(apiUrl(apiPath, params), apiPath);
}

const pageSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.object({ paging: z.object({ next: z.url().optional() }).optional() }).optional(),
});

const PAGE_SIZE = '200';

/**
 * Every record of a Clio list endpoint, following `meta.paging.next`. One
 * request at a time, so a full sync stays inside Clio's rate limit.
 */
export async function clioGetAll(apiPath: string, params: Record<string, string> = {}): Promise<unknown[]> {
  const rows: unknown[] = [];
  const origin = new URL(env.CLIO_BASE_URL).origin;
  let url: URL | null = apiUrl(apiPath, { limit: PAGE_SIZE, ...params });
  while (url) {
    const page = pageSchema.parse(await request(url, apiPath));
    rows.push(...page.data);
    const next: string | undefined = page.meta?.paging?.next;
    // Only ever send the token back to Clio itself.
    url = next && new URL(next).origin === origin ? new URL(next) : null;
  }
  return rows;
}

const whoAmISchema = z.object({
  data: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    account: z.object({ id: z.number(), name: z.string() }),
  }),
});
export type ClioUser = z.infer<typeof whoAmISchema>['data'];

export async function getWhoAmI(): Promise<ClioUser> {
  const body = await clioGet('/users/who_am_i.json', { fields: 'id,name,email,account{id,name}' });
  return whoAmISchema.parse(body).data;
}
