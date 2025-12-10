import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote } from '@/lib/github/notes';
import { generateDraft } from '@/lib/ai/anthropic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = await getNote(id);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Generate draft using Claude
    const draft = await generateDraft({
      content: note.content,
      urls: [],
    });

    // Update note with generated draft
    const updated = await updateNote(id, {
      content: draft,
      status: 'draft',
    });

    return NextResponse.json({ note: updated, generated: draft });
  } catch (error) {
    console.error('Failed to generate draft:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
