'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    enabled: true,
    schedule: '0 2 * * *',
    hnEnabled: true,
    hnMinScore: 100,
    redditEnabled: true,
    subreddits: ['programming', 'MachineLearning', 'LocalLLaMA', 'ExperiencedDevs'],
    topics: ['AI', 'LLM', 'distributed systems', 'Kafka', 'Flink', 'data engineering'],
    relevanceThreshold: 0.7,
  });

  const handleSave = async () => {
    // TODO: Save to API
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Automation Settings</h1>
        <p className="text-muted-foreground">Configure background content monitoring</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <h3 className="font-medium">Enable Automation</h3>
            <p className="text-sm text-muted-foreground">Run background jobs to monitor sources</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-foreground peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h3 className="font-medium">Schedule</h3>
          <input
            type="text"
            value={config.schedule}
            onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm font-mono"
            placeholder="Cron expression"
          />
          <p className="text-xs text-muted-foreground">Cron expression (default: 2:00 AM daily)</p>
        </div>

        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h3 className="font-medium">Topics to Monitor</h3>
          <input
            type="text"
            value={config.topics.join(', ')}
            onChange={(e) => setConfig({ ...config, topics: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="AI, LLM, distributed systems..."
          />
        </div>

        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h3 className="font-medium">Subreddits</h3>
          <input
            type="text"
            value={config.subreddits.join(', ')}
            onChange={(e) => setConfig({ ...config, subreddits: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="programming, MachineLearning..."
          />
        </div>

        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
