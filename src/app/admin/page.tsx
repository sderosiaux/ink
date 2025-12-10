import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// This will be replaced with actual data fetching
const mockNotes = [
  { id: '1', title: 'First Post Idea', status: 'idea', tags: ['ai'], updatedAt: new Date() },
  { id: '2', title: 'Draft Article', status: 'draft', tags: ['tech', 'tutorial'], updatedAt: new Date() },
  { id: '3', title: 'Ready to Publish', status: 'ready', tags: ['engineering'], updatedAt: new Date() },
];

function NotesList() {
  return (
    <div className="rounded-lg border border-border">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select className="h-9 rounded-md border border-border bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="idea">Ideas</option>
              <option value="draft">Drafts</option>
              <option value="ready">Ready</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <input
              type="search"
              placeholder="Search notes..."
              className="h-9 w-64 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
          <Button>New Note</Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {mockNotes.map((note) => (
          <div key={note.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <Badge variant={note.status as any}>{note.status}</Badge>
              <div>
                <h3 className="font-medium">{note.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {note.updatedAt.toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">Preview</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-muted-foreground">Manage your notes and articles</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NotesList />
      </Suspense>
    </div>
  );
}
