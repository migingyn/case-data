# 0002: LLM model

**Status:** Accepted
**Date:** 2026-10-02
**Owner:** Mikey Nguyen

## Context
Hackathon, ~6 hours. The LLM work is lightweight (extraction and
summarization of case data into structured output), so we favor low
latency and low cost over deep reasoning. Inputs may contain sensitive
information, and AI calls stay server-side (see 0001).

## Decision
OpenAI GPT-5.4 mini, called from the Express backend.
- $0.75 / 1M input, $4.50 / 1M output, $0.075 / 1M cached input
- 400K context, 128K max output
- Keep the call behind `src/api/` so the provider can be swapped by
  changing one file.

## Alternatives considered
- Full GPT-5.4 or a reasoning model: better on multi-step and subtle
  extraction, but slower and costlier; reasoning tokens bill as output.
- Smaller OpenAI tier (nano): cheaper and faster, but weaker at
  instruction following and structured output.
- Anthropic Haiku 4.5 ($1 / $5, 200K context): strong small model, but
  about a third more per token and a smaller context window.
- Anthropic Sonnet 5.5 ($2 / $10): far more capable, but over 2x the
  price; the reasoning is not needed here.
- Groq (open models such as Llama 3.3 70B at $0.59 / $0.79, GPT-OSS 20B
  at $0.075 / $0.30): about 400-1,000 tokens/sec and cheapest, but
  open-weight models are weaker at tool calling and structured output.

## Consequences
- Weaker on hard reasoning and edge cases in messy documents; validate
  output with zod at the API boundary.
- Output tokens cost 6x input: keep responses short and structured.
- Put the stable system prompt and schema first so caching applies.
- Cost is judged per completed task, since retries erase per-token savings.
- Check OpenAI data retention terms before sending real case data.
- Pricing for other OpenAI models and Groq is unverified; confirm on the
  providers' pricing pages before relying on those figures.
