import { NextResponse } from 'next/server';

const MOOLE_API_URL = 'https://moole-back.vercel.app/ask-moole';
const TIMEOUT_MS = 15_000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY not set in environment');
}
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Working free models from user's successful curl tests
const FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',  // Tested - works great
  'openrouter/free',                          // Tested - auto-selects best free
];

async function callOpenRouterDirect(question: string): Promise<{ answer: string; model: string } | null> {
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying OpenRouter direct: ${model}`);
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful fitness and nutrition assistant.' },
            { role: 'user', content: question },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`OpenRouter ${model} failed: ${response.status} ${errText}`);
        continue;
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (answer) {
        console.log(`OpenRouter success with ${model}`);
        return { answer, model };
      }
    } catch (err) {
      console.warn(`OpenRouter ${model} error:`, err);
      continue;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    // Try ask-moole first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(MOOLE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          return NextResponse.json({ answer: data.answer });
        }
      }
      console.warn('Moole API failed or returned empty, falling back to OpenRouter direct');
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.warn('Moole fetch failed:', isTimeout ? 'timeout' : fetchError, '- falling back to OpenRouter direct');
    }

    // Fallback to OpenRouter direct call with tested working models
    const result = await callOpenRouterDirect(question);
    if (result) {
      return NextResponse.json({ answer: result.answer, model_used: result.model });
    }

    return NextResponse.json(
      { answer: null, error: 'all_providers_failed' },
      { status: 502 }
    );
  } catch (error) {
    console.error('AI analyse route error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}