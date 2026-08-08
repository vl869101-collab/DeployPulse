'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Download, Check, Zap, Shield, Crown, ExternalLink } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'R$49',
    period: '/mo',
    monitors: 10,
    checks: '10k',
    features: ['10 monitors', '10,000 checks/mo', 'Email alerts', '7-day retention'],
    current: false,
  },
  {
    name: 'Pro',
    price: 'R$100',
    period: '/mo',
    monitors: 50,
    checks: '100k',
    features: ['50 monitors', '100,000 checks/mo', 'Slack + PagerDuty', '30-day retention', 'Status pages'],
    current: true,
  },
  {
    name: 'Business',
    price: 'R$150',
    period: '/mo',
    monitors: 200,
    checks: '500k',
    features: ['200 monitors', '500,000 checks/mo', 'All integrations', '90-day retention', 'Custom branding', 'SSO'],
    current: false,
  },
];

const invoices = [
  { id: 'INV-2024-03', date: 'Mar 1, 2024', amount: 'R$100,00', status: 'paid' },
  { id: 'INV-2024-02', date: 'Feb 1, 2024', amount: 'R$100,00', status: 'paid' },
  { id: 'INV-2024-01', date: 'Jan 1, 2024', amount: 'R$100,00', status: 'paid' },
  { id: 'INV-2023-12', date: 'Dec 1, 2023', amount: 'R$49,00', status: 'paid' },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans" className="gap-2"><Zap className="h-4 w-4" /> Plans</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2"><Download className="h-4 w-4" /> Invoices</TabsTrigger>
          <TabsTrigger value="payment" className="gap-2"><CreditCard className="h-4 w-4" /> Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.current ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name === 'Business' ? <Crown className="h-5 w-5 text-amber-500" /> : plan.name === 'Pro' ? <Zap className="h-5 w-5 text-primary" /> : <Shield className="h-5 w-5 text-muted-foreground" />}
                      {plan.name}
                    </CardTitle>
                    {plan.current && <Badge>Current</Badge>}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.current ? 'outline' : 'default'} disabled={plan.current}>
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usage This Month</p>
                  <p className="text-sm text-muted-foreground">32 of 50 monitors · 47,230 of 100,000 checks</p>
                </div>
                <Button variant="link" className="gap-1">View details <ExternalLink className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download past invoices for your records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{inv.id}</p>
                        <p className="text-sm text-muted-foreground">{inv.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{inv.amount}</span>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">{inv.status}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-[#30363D] bg-[#161B22] p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Default</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billing Address</p>
                  <p className="text-sm text-muted-foreground">Rua Example 123, São Paulo, BR</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
