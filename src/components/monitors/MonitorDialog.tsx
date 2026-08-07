'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, MonitorType } from '@/types';

interface MonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Monitor>) => void;
  monitor?: Monitor | null;
}

const monitorTypes: MonitorType[] = ['http', 'https', 'tcp', 'ping', 'keyword', 'dns', 'ssl'];

export function MonitorDialog({ open, onOpenChange, onSave, monitor }: MonitorDialogProps) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [type, setType] = React.useState<MonitorType>('https');
  const [interval, setInterval] = React.useState('60');
  const [timeout, setTimeout] = React.useState('30');
  const [tags, setTags] = React.useState('');

  React.useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setUrl(monitor.url);
      setType(monitor.type);
      setInterval(String(monitor.interval));
      setTimeout(String(monitor.timeout));
      setTags(monitor.tags.join(', '));
    } else {
      setName('');
      setUrl('');
      setType('https');
      setInterval('60');
      setTimeout('30');
      setTags('');
    }
  }, [monitor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      url,
      type,
      interval: Number(interval),
      timeout: Number(timeout),
      retries: 3,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'pending',
      uptime: 100,
      projectId: 'proj_1',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{monitor ? 'Edit Monitor' : 'New Monitor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My API" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL / Host</Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MonitorType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monitorTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interval (sec)</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[30, 60, 120, 300, 600, 1800, 3600].map((s) => (
                    <SelectItem key={s} value={String(s)}>{s < 60 ? `${s}s` : `${s / 60}m`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (sec)</Label>
            <Input id="timeout" type="number" value={timeout} onChange={(e) => setTimeout(e.target.value)} min={5} max={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="api, production" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{monitor ? 'Save Changes' : 'Create Monitor'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
