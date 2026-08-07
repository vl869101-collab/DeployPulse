'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Globe, ExternalLink, Eye, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { fetchStatusPages, createStatusPage, deleteStatusPage, fetchMonitors } from '@/lib/api-client';
import { StatusPage, Monitor } from '@/types';

export default function StatusPagesPage() {
  const [pages, setPages] = React.useState<StatusPage[]>([]);
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [open, setOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newSlug, setNewSlug] = React.useState('');

  const load = React.useCallback(() => {
    Promise.all([fetchStatusPages(), fetchMonitors()]).then(([p, m]) => {
      setPages(p);
      setMonitors(m);
    });
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const cleanSlug = (newSlug || newTitle).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    await createStatusPage({ title: newTitle, slug: cleanSlug, monitorIds: [] });
    setOpen(false);
    setNewTitle('');
    setNewSlug('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this status page?')) return;
    await deleteStatusPage(id);
    load();
  };

  const getStatusSummary = (page: StatusPage) => {
    const pageMonitors = monitors.filter((m) => page.monitorIds.includes(m.id));
    if (pageMonitors.length === 0) return 'no monitors';
    if (pageMonitors.every((m) => m.status === 'up')) return 'operational';
    if (pageMonitors.some((m) => m.status === 'down')) return 'outage';
    return 'degraded';
  };

  const statusColor: Record<string, string> = {
    operational: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    outage: 'bg-red-500/15 text-red-400 border-red-500/30',
    'no monitors': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status Pages</h1>
          <p className="text-muted-foreground">Public status pages for your services</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Status Page</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Status Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Production Status" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="production-status" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pages.map((page) => {
          const status = getStatusSummary(page);
          const monitorCount = monitors.filter((m) => page.monitorIds.includes(m.id)).length;
          return (
            <Card key={page.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {page.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    {page.customDomain || `/status/${page.slug}`}
                    <ExternalLink className="h-3 w-3" />
                  </CardDescription>
                </div>
                <Badge variant="outline" className={statusColor[status]}>{status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monitors</span>
                  <span className="font-medium">{monitorCount}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <Link href={`/status/${page.slug}`} target="_blank"><Eye className="h-4 w-4" /> Preview</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <Link href={`/status/manage/${page.id}`}><Settings className="h-4 w-4" /> Configure</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(page.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
