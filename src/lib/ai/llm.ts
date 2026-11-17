/**
 * Server-side LLM access via OpenRouter (OpenAI-compatible API).
 * Never import this from client components: it reads OPENROUTER_API_KEY.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** Fast, cheap model for structured generation (plan tables, titles, prompt enhancing). */
export const FAST_MODEL = process.env.AI_MODEL_FAST || 'anthropic/claude-haiku-5.5';
/** Stronger model for the conversational assistant / agent. */
export const SMART_MODEL = process.env.AI_MODEL_SMART || 'anthropic/claude-sonnet-5.5';

export function hasLLM(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

export type ChatContent =
  | string
  | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: ChatContent;
}

export interface CompleteOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export async function complete(messages: ChatMessage[], opts: CompleteOptions = {}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse-fit.vercel.app',
        'X-Title': 'Synapse Fit',
      },
      body: JSON.stringify({
        model: opts.model ?? FAST_MODEL,
        messages,
        max_tokens: opts.maxTokens ?? 4000,
        temperature: opts.temperature ?? 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('OpenRouter returned an empty answer');
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/** Single question in, answer out — the shape the existing /api/ai/analyse callers expect. */
export async function ask(question: string, opts: CompleteOptions & { system?: string } = {}): Promise<string> {
  const messages: ChatMessage[] = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  messages.push({ role: 'user', content: question });
  return complete(messages, opts);
}
