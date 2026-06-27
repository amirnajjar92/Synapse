import { NextResponse } from 'next/server';

const MOOLE_API_URL = 'https://moole-back.vercel.app/ask-moole';
const OPENROUTER_PROXY_URL = 'https://moole-back.vercel.app/ask-openrouter';
const TIMEOUT_MS = 15_000;

async function callOpenRouterProxy(question: string): Promise<{ answer: string; model: string } | null> {
  try {
    console.log('Calling Flask ask-openrouter proxy');
    const response = await fetch(OPENROUTER_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`ask-openrouter proxy failed: ${response.status} ${errText}`);
      return null;
    }

    const data = await response.json();
    if (data.answer) {
      console.log(`ask-openrouter success with ${data.model_used || 'unknown'}`);
      return { answer: data.answer, model: data.model_used || 'unknown' };
    }
    return null;
  } catch (err) {
    console.warn('ask-openrouter proxy error:', err);
    return null;
  }
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
      console.warn('Moole API failed or returned empty, falling back to ask-openrouter proxy');
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.warn('Moole fetch failed:', isTimeout ? 'timeout' : fetchError, '- falling back to ask-openrouter proxy');
    }

    // Fallback to ask-openrouter proxy on Flask
    const result = await callOpenRouterProxy(question);
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