import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../env.ts';

// One firm-wide Clio connection, kept in a git-ignored file under DATA_DIR
// until there is sign-in and a Supabase table to hold it per user.
const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  /** Epoch milliseconds when the access token expires. */
  expiresAt: z.number(),
});
export type ClioTokens = z.infer<typeof tokensSchema>;

const tokenFile = path.resolve(env.DATA_DIR, 'clio-tokens.json');

export async function getTokens(): Promise<ClioTokens | null> {
  try {
    return tokensSchema.parse(JSON.parse(await readFile(tokenFile, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function saveTokens(tokens: ClioTokens): Promise<void> {
  await mkdir(path.dirname(tokenFile), { recursive: true });
  await writeFile(tokenFile, JSON.stringify(tokens), { mode: 0o600 });
}

export async function clearTokens(): Promise<void> {
  await rm(tokenFile, { force: true });
}
