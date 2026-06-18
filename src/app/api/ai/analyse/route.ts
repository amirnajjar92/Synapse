import { NextResponse } from 'next/server';

const MOOLE_API_URL = 'https://moole-back.vercel.app/ask-moole';
const TIMEOUT_MS = 15_000;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

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

      if (!res.ok) {
        console.error('Moole API returned', res.status);
        return NextResponse.json(
          { answer: null, error: `upstream_error_${res.status}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      return NextResponse.json({ answer: data.answer ?? null });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout =
        fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error('Moole fetch failed:', isTimeout ? 'timeout' : fetchError);
      return NextResponse.json(
        { answer: null, error: isTimeout ? 'timeout' : 'network_error' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('AI analyse route error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
