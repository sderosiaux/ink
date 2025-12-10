import { NextRequest, NextResponse } from 'next/server';
import { createNote, listNotes, type ListNotesOptions, type CreateNoteInput } from '@/lib/github/notes';
import { z } from 'zod';

const listQuerySchema = z.object({
  status: z.enum(['idea', 'draft', 'ready', 'scheduled', 'published', 'archived']).optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const createBodySchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  status: z.enum(['idea', 'draft', 'ready', 'scheduled', 'published', 'archived']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = listQuerySchema.parse({
      status: searchParams.get('status') ?? undefined,
      tags: searchParams.get('tags') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });

    const options: ListNotesOptions = {
      status: query.status,
      tags: query.tags?.split(',').filter(Boolean),
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    };

    const notes = await listNotes(options);
    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
    }
    console.error('Failed to list notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createBodySchema.parse(body);

    const note = await createNote(input as CreateNoteInput);
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.issues }, { status: 400 });
    }
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
