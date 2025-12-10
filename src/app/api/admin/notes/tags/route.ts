import { NextResponse } from 'next/server';
import { getAllTags } from '@/lib/github/notes';

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Failed to get tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
