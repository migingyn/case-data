import OpenAI from 'openai';
import { env } from './env.ts';
import { HttpError } from './errors.ts';

// One client for the server; brief generation will reuse it.
export const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export function requireOpenAI(): OpenAI {
  if (!openai) throw new HttpError(503, 'OpenAI is not configured. Set OPENAI_API_KEY.');
  return openai;
}

export interface PingResult {
  model: string;
  reply: string;
  latencyMs: number;
}

/** Proves the key and model work with a fixed prompt. Sends no case data. */
export async function pingModel(): Promise<PingResult> {
  const client = requireOpenAI();
  const startedAt = Date.now();
  try {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      instructions: 'You are a connectivity check. Reply with the single word: ok',
      input: 'ping',
    });
    return { model: response.model, reply: response.output_text, latencyMs: Date.now() - startedAt };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new HttpError(502, `OpenAI request failed (${error.status ?? 'network'}): ${error.message}`);
    }
    throw error;
  }
}
