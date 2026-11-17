import { NextResponse } from 'next/server';
import { complete, hasLLM, FAST_MODEL } from '@/lib/ai/llm';

const MAX_IMAGE_CHARS = 12_000_000; // ~9MB image as base64

export async function POST(request: Request) {
  try {
    if (!hasLLM()) {
      return NextResponse.json({ error: 'ai_not_configured' }, { status: 503 });
    }

    const { image_base64, prompt } = await request.json();
    if (typeof image_base64 !== 'string' || !image_base64) {
      return NextResponse.json({ error: 'image_base64 is required' }, { status: 400 });
    }
    if (image_base64.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: 'image_too_large' }, { status: 413 });
    }

    const url = image_base64.startsWith('data:') ? image_base64 : `data:image/jpeg;base64,${image_base64}`;
    const instruction =
      typeof prompt === 'string' && prompt.trim()
        ? prompt.slice(0, 1000)
        : 'Describe the fitness data visible in this image.';

    const description = await complete(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            { type: 'image_url', image_url: { url } },
          ],
        },
      ],
      { model: process.env.AI_MODEL_VISION || FAST_MODEL, maxTokens: 600, timeoutMs: 45_000 }
    );

    return NextResponse.json({ description });
  } catch (error) {
    console.error('describe-image error:', error);
    return NextResponse.json({ error: 'describe_failed' }, { status: 502 });
  }
}
