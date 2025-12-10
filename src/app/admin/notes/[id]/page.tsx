import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteEditorPage({ params }: PageProps) {
  const { id } = await params;
  // TODO: Fetch note by ID

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="draft">draft</Badge>
          <h1 className="text-xl font-bold">Edit Note</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Preview</Button>
          <Button variant="outline">Generate Draft</Button>
          <Button>Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Editor */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full h-12 rounded-md border border-border bg-background px-4 text-lg font-medium"
          />
          <textarea
            placeholder="Start writing..."
            className="w-full h-full rounded-md border border-border bg-background p-4 font-mono text-sm resize-none"
          />
        </div>

        {/* Preview */}
        <div className="rounded-md border border-border bg-muted/30 p-6 overflow-auto">
          <p className="text-muted-foreground">Preview will appear here...</p>
        </div>
      </div>
    </div>
  );
}
