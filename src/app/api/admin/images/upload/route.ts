import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, buildImagePath } from '@/lib/storage/r2';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const noteId = formData.get('noteId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    const imageId = randomUUID();
    const ext = file.name.split('.').pop() || 'png';
    const key = buildImagePath(noteId, imageId, ext);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(key, buffer, file.type);

    return NextResponse.json({
      image: {
        id: imageId,
        url,
        noteId,
      }
    });
  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
