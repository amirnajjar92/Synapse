import { NextResponse } from 'next/server';

const MOOLE_API_URL = 'https://moole-back.vercel.app/google-search';
const TIMEOUT_MS = 15_000;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(MOOLE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error('Google Search API returned', res.status);
        return NextResponse.json(
          { results: [], error: `upstream_error_${res.status}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      return NextResponse.json({ results: data || [] });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isTimeout =
        fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error('Google Search fetch failed:', isTimeout ? 'timeout' : fetchError);
      return NextResponse.json(
        { results: [], error: isTimeout ? 'timeout' : 'network_error' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Google Search route error:', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
