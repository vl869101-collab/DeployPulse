'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Mail, MessageSquare, Phone, Webhook, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { fetchAlerts } from '@/lib/api-client';
import { Alert } from '@/types';

interface AlertChannel {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  slack: <MessageSquare className="h-5 w-5" />,
  discord: <MessageSquare className="h-5 w-5" />,
  pagerduty: <Phone className="h-5 w-5" />,
  webhook: <Webhook className="h-5 w-5" />,
  down: <AlertTriangle className="h-5 w-5" />,
  degraded: <Info className="h-5 w-5" />,
  recovery: <CheckCircle className="h-5 w-5" />,
  ssl_expiring: <AlertTriangle className="h-5 w-5" />,
  domain_expiring: <AlertTriangle className="h-5 w-5" />,
};

function toChannel(alert: Alert): AlertChannel {
  return {
    id: alert.id,
    name: alert.message,
    type: alert.type,
    enabled: !alert.acknowledged,
    config: `Monitor: ${alert.monitorId}`,
  };
}

export default function AlertsPage() {
  const [alertChannels, setAlertChannels] = React.useState<AlertChannel[]>([]);

  React.useEffect(() => {
    let active = true;

    fetchAlerts().then((alerts) => {
      if (active) setAlertChannels(alerts.map(toChannel));
    });

    return () => {
      active = false;
    };
  }, []);

  const toggle = (id: string) => {
    setAlertChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert Channels</h1>
          <p className="text-muted-foreground">Configure how you receive alerts and notifications</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="space-y-4">
        {alertChannels.map((channel) => (
          <Card key={channel.id}>
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-center text-muted-foreground">
                  {typeIcon[channel.type]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{channel.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {channel.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{channel.config}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch checked={channel.enabled} onCheckedChange={() => toggle(channel.id)} />
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
