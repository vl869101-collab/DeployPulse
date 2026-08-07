'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Key, Shield, Save, Copy, RefreshCw, Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
}

const mockKeys: ApiKey[] = [
  { id: '1', name: 'Production', key: 'dp_live_sk_a1b2c3d4e5f6g7h8i9j0', createdAt: '2024-01-15', lastUsed: '2024-03-10' },
  { id: '2', name: 'Staging', key: 'dp_test_sk_x1y2z3w4v5u6t7s8r9q0', createdAt: '2024-02-20', lastUsed: '2024-03-09' },
];

export default function SettingsPage() {
  const [name, setName] = React.useState('Victor');
  const [email, setEmail] = React.useState('victor@example.com');
  const [company, setCompany] = React.useState('DeployPulse');
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [slackAlerts, setSlackAlerts] = React.useState(false);
  const [weeklyReport, setWeeklyReport] = React.useState(true);
  const [incidentNotify, setIncidentNotify] = React.useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Key className="h-4 w-4" /> API Keys</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input defaultValue="UTC-3 (Brasília)" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Email Alerts', desc: 'Receive alerts via email', state: emailAlerts, set: setEmailAlerts },
                { label: 'Slack Notifications', desc: 'Post alerts to Slack channel', state: slackAlerts, set: setSlackAlerts },
                { label: 'Weekly Report', desc: 'Summary of monitor performance', state: weeklyReport, set: setWeeklyReport },
                { label: 'Incident Notifications', desc: 'Real-time incident updates', state: incidentNotify, set: setIncidentNotify },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.state} onCheckedChange={item.set} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button><Save className="mr-2 h-4 w-4" /> Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API access keys</CardDescription>
              </div>
              <Button size="sm"><Key className="mr-2 h-4 w-4" /> Generate New Key</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{k.name}</span>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                    <code className="text-sm text-muted-foreground font-mono">{k.key.slice(0, 16)}...{k.key.slice(-4)}</code>
                    <p className="text-xs text-muted-foreground mt-1">Created {k.createdAt} · Last used {k.lastUsed}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
                </div>
                <Button variant="outline">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
