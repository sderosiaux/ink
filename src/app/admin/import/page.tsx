'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ImportPage() {
  const [input, setInput] = useState('');
  const [cleaned, setCleaned] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClean = async () => {
    setIsProcessing(true);
    // TODO: Call cleaning API
    setCleaned(input); // Placeholder
    setIsProcessing(false);
  };

  const handleSave = async () => {
    // TODO: Create note from cleaned content
    alert('Note created!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Content</h1>
        <p className="text-muted-foreground">Paste content from Medium, Substack, or other sources</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste your content</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 rounded-md border border-border bg-background p-4 font-mono text-sm resize-none"
            placeholder="Paste your markdown or HTML content here..."
          />
          <Button onClick={handleClean} disabled={!input || isProcessing}>
            {isProcessing ? 'Processing...' : 'Clean & Preview'}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cleaned output</label>
          <textarea
            value={cleaned}
            onChange={(e) => setCleaned(e.target.value)}
            className="w-full h-96 rounded-md border border-border bg-background p-4 font-mono text-sm resize-none"
            placeholder="Cleaned content will appear here..."
          />
          <Button onClick={handleSave} disabled={!cleaned}>
            Save as Note
          </Button>
        </div>
      </div>
    </div>
  );
}
