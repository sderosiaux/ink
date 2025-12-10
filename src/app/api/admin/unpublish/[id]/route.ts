import { NextRequest, NextResponse } from 'next/server';
import { unpublishNote } from '@/lib/publish/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await unpublishNote(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Note unpublished successfully'
    });
  } catch (error) {
    console.error('Unpublish error:', error);
    return NextResponse.json({ error: 'Failed to unpublish' }, { status: 500 });
  }
}
