import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { env } from '../env.ts';
import { HttpError } from '../errors.ts';
import type { ClioTokens } from './tokenStore.ts';

const STATE_TTL_MS = 10 * 60 * 1000;

// CSRF state for in-flight authorizations: state → expiry. In memory is
// enough for one local server; a restart just means connecting again.
const pendingStates = new Map<string, number>();

function clientCredentials() {
  if (!env.CLIO_CLIENT_ID || !env.CLIO_CLIENT_SECRET) {
    throw new HttpError(503, 'Clio is not configured. Set CLIO_CLIENT_ID and CLIO_CLIENT_SECRET.');
  }
  return { client_id: env.CLIO_CLIENT_ID, client_secret: env.CLIO_CLIENT_SECRET };
}

export const isClioConfigured = () => Boolean(env.CLIO_CLIENT_ID && env.CLIO_CLIENT_SECRET);

export function createState(): string {
  const now = Date.now();
  for (const [state, expiresAt] of pendingStates) {
    if (expiresAt < now) pendingStates.delete(state);
  }
  const state = randomBytes(24).toString('base64url');
  pendingStates.set(state, now + STATE_TTL_MS);
  return state;
}

/** True once per valid state; the state is spent either way. */
export function consumeState(state: string): boolean {
  const expiresAt = pendingStates.get(state);
  pendingStates.delete(state);
  return expiresAt !== undefined && expiresAt >= Date.now();
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL('/oauth/authorize', env.CLIO_BASE_URL);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientCredentials().client_id,
    redirect_uri: env.CLIO_REDIRECT_URI,
    state,
  }).toString();
  return url.toString();
}

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  /** Clio omits this on refresh; the existing refresh token stays valid. */
  refresh_token: z.string().min(1).optional(),
  expires_in: z.number(),
});

async function requestTokens(params: Record<string, string>): Promise<z.infer<typeof tokenResponseSchema>> {
  const response = await fetch(new URL('/oauth/token', env.CLIO_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...clientCredentials(), ...params }),
  });
  // Don't surface the body: it can echo credentials back.
  if (!response.ok) throw new HttpError(502, `Clio token request failed (${response.status}).`);
  return tokenResponseSchema.parse(await response.json());
}

const toExpiresAt = (expiresIn: number) => Date.now() + expiresIn * 1000;

export async function exchangeCode(code: string): Promise<ClioTokens> {
  const tokens = await requestTokens({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.CLIO_REDIRECT_URI,
  });
  if (!tokens.refresh_token) throw new HttpError(502, 'Clio did not return a refresh token.');
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: toExpiresAt(tokens.expires_in),
  };
}

export async function refreshTokens(refreshToken: string): Promise<ClioTokens> {
  const tokens = await requestTokens({ grant_type: 'refresh_token', refresh_token: refreshToken });
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
    expiresAt: toExpiresAt(tokens.expires_in),
  };
}

/** Revokes the app's access in Clio. Best effort: local tokens are cleared regardless. */
export async function deauthorize(accessToken: string): Promise<void> {
  await fetch(new URL('/oauth/deauthorize', env.CLIO_BASE_URL), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ token: accessToken }),
  }).catch(() => undefined);
}
