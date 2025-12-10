import { NextRequest, NextResponse } from 'next/server';
import { getNote, updateNote, deleteNote, type UpdateNoteInput } from '@/lib/github/notes';
import { z } from 'zod';

const updateBodySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['idea', 'draft', 'ready', 'scheduled', 'published', 'archived']).optional(),
  slug: z.string().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  heroImageId: z.string().uuid().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = await getNote(id);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Failed to get note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = updateBodySchema.parse(body);

    const updateInput: UpdateNoteInput = {
      ...input,
      scheduledAt: input.scheduledAt === null ? null : input.scheduledAt,
    };

    const note = await updateNote(id, updateInput);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('Invalid status transition')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteNote(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
