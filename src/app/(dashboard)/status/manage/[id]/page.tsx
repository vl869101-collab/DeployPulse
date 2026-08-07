'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Eye, Trash2, Globe } from 'lucide-react';
import Link from 'next/link';
import { fetchStatusPage, updateStatusPage, deleteStatusPage, fetchMonitors } from '@/lib/api-client';
import { StatusPage, Monitor } from '@/types';

export default function StatusPageEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [page, setPage] = React.useState<StatusPage | null>(null);
  const [allMonitors, setAllMonitors] = React.useState<Monitor[]>([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [customDomain, setCustomDomain] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([fetchStatusPage(id), fetchMonitors()]).then(([p, m]) => {
      if (p) {
        setPage(p);
        setTitle(p.title);
        setDescription(p.description || '');
        setSlug(p.slug);
        setCustomDomain(p.customDomain || '');
        setIsPublic(p.public);
        setSelectedIds(p.monitorIds || []);
      }
      setAllMonitors(m);
    });
  }, [id]);

  const toggleMonitor = (monitorId: string) => {
    setSelectedIds((prev) =>
      prev.includes(monitorId) ? prev.filter((i) => i !== monitorId) : [...prev, monitorId]
    );
  };

  const sanitizeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const handleSave = async () => {
    setSaving(true);
    const cleanSlug = sanitizeSlug(slug);
    setSlug(cleanSlug);
    await updateStatusPage(id, {
      title,
      description: description || null,
      slug: cleanSlug,
      customDomain: customDomain || null,
      public: isPublic,
      monitorIds: selectedIds,
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this status page?')) return;
    await deleteStatusPage(id);
    router.push('/status');
  };

  if (!page) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const publicUrl = `/status/${slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/status" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Status Page</h1>
            <p className="text-sm text-muted-foreground">Configure your public status page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</a>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                </div>
                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="status.example.com" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitors</CardTitle>
              <CardDescription>Select which monitors to show on this status page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allMonitors.map((monitor) => (
                  <div key={monitor.id} className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedIds.includes(monitor.id)} onCheckedChange={() => toggleMonitor(monitor.id)} />
                      <div>
                        <p className="font-medium text-sm">{monitor.name}</p>
                        <p className="text-xs text-muted-foreground">{monitor.url}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      monitor.status === 'up' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      monitor.status === 'down' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                      'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }>
                      {monitor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Public URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3">
                <code className="text-sm text-primary break-all">{publicUrl}</code>
              </div>
              {customDomain && (
                <>
                  <Separator className="my-3" />
                  <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3">
                    <p className="text-xs text-muted-foreground mb-1">Custom Domain</p>
                    <code className="text-sm text-primary break-all">https://{customDomain}</code>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{selectedIds.length} monitor(s) selected</p>
              <p className="text-sm text-muted-foreground">{isPublic ? 'Public' : 'Private'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
