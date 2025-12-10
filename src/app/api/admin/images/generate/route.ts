import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateImages, buildImagePrompt, getAvailableStyles } from '@/lib/ai/gemini';

const generateSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().optional(),
  count: z.number().min(1).max(8).default(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style, count } = generateSchema.parse(body);

    // Build full prompt with style
    const fullPrompt = buildImagePrompt(prompt, style ?? 'minimalist');

    // Generate images (placeholder - returns empty until Gemini API implemented)
    const images = await generateImages({ prompt: fullPrompt, style, count });

    // Return prompts even if images weren't generated (for manual use)
    return NextResponse.json({
      images,
      prompt: fullPrompt,
      availableStyles: getAvailableStyles(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    console.error('Failed to generate images:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
