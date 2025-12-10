import { NextRequest, NextResponse } from 'next/server';
import { getScheduledNotes, getNote } from '@/lib/github/notes';
import { publishNote } from '@/lib/publish/service';

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find scheduled notes that should be published
    const scheduledNotes = await getScheduledNotes();

    const results = [];

    for (const noteMeta of scheduledNotes) {
      const note = await getNote(noteMeta.slug);
      if (!note) continue;

      const result = await publishNote(noteMeta.slug);
      results.push({
        slug: noteMeta.slug,
        title: noteMeta.frontmatter.title,
        ...result,
      });
    }

    return NextResponse.json({
      processed: scheduledNotes.length,
      results,
    });
  } catch (error) {
    console.error('Cron publish error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
