import { NextResponse } from 'next/server';
import { ask, hasLLM } from '@/lib/ai/llm';

// Legacy external backend, kept only as a fallback when OPENROUTER_API_KEY is not configured.
const MOOLE_API_URL = 'https://moole-back.vercel.app/ask-moole';
const OPENROUTER_PROXY_URL = 'https://moole-back.vercel.app/ask-openrouter';
const TIMEOUT_MS = 15_000;

const SYSTEM_PROMPT =
  'You are the AI engine of Synapse Fit, a fitness and nutrition planning app. ' +
  'Follow the output format requested in the question exactly. ' +
  'When JSON is requested, return only valid JSON with no commentary and no markdown fences.';

async function callLegacyBackend(question: string): Promise<{ answer: string; model?: string } | null> {
  for (const url of [MOOLE_API_URL, OPENROUTER_PROXY_URL]) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answer) return { answer: data.answer, model: data.model_used };
      } else {
        console.warn(`Legacy AI backend ${url} failed: ${res.status}`);
      }
    } catch (err) {
      console.warn(`Legacy AI backend ${url} error:`, err);
    } finally {
      clearTimeout(timeoutId);
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Accept `prompt` too: some internal callers used that name.
    const question = body?.question ?? body?.prompt;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    if (hasLLM()) {
      try {
        const answer = await ask(question, { system: SYSTEM_PROMPT });
        return NextResponse.json({ answer });
      } catch (err) {
        console.error('Direct LLM call failed, trying legacy backend:', err);
      }
    } else {
      console.warn('OPENROUTER_API_KEY not set; using legacy moole backend');
    }

    const result = await callLegacyBackend(question);
    if (result) {
      return NextResponse.json({ answer: result.answer, model_used: result.model });
    }

    return NextResponse.json({ answer: null, error: 'all_providers_failed' }, { status: 502 });
  } catch (error) {
    console.error('AI analyse route error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
