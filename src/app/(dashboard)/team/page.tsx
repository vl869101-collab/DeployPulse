'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Mail, Trash2, Crown, Shield, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited';
  lastActive: string;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Victor', email: 'victor@example.com', role: 'owner', status: 'active', lastActive: 'Just now' },
  { id: '2', name: 'Ana Silva', email: 'ana@example.com', role: 'admin', status: 'active', lastActive: '2 hours ago' },
  { id: '3', name: 'Carlos Souza', email: 'carlos@example.com', role: 'member', status: 'active', lastActive: '1 day ago' },
  { id: '4', name: 'Maria Costa', email: 'maria@example.com', role: 'viewer', status: 'invited', lastActive: 'Pending' },
];

const roleIcon: Record<string, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-amber-500" />,
  admin: <Shield className="h-4 w-4 text-primary" />,
  member: <User className="h-4 w-4 text-muted-foreground" />,
  viewer: <User className="h-4 w-4 text-muted-foreground" />,
};

const roleColor: Record<string, string> = {
  owner: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  admin: 'bg-primary/15 text-primary border-primary/30',
  member: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  viewer: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function TeamPage() {
  const [open, setOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('member');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your team members and roles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input id="invite-email" type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setOpen(false)}><Mail className="mr-2 h-4 w-4" /> Send Invite</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({mockTeam.length})</CardTitle>
          <CardDescription>People with access to this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeam.map((member) => (
              <div key={member.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.status === 'invited' && <Badge variant="outline" className="text-xs">Invited</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{member.lastActive}</span>
                    <Badge variant="outline" className={`gap-1 ${roleColor[member.role]}`}>
                      {roleIcon[member.role]}
                      {member.role}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {member.id !== mockTeam[mockTeam.length - 1].id && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
