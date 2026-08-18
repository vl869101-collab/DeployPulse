'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TerminalSquare } from 'lucide-react';
import { deployments, deployLogLines } from '@/lib/deploy-data';

export function DeployLog() {
  const [tab, setTab] = useState<'settings' | 'logs'>('logs');
  const [filter, setFilter] = useState('');
  const deploy = deployments[0];
  const lines = deployLogLines.filter((l) =>
    l.message.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">Latest Deployment</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border-green-500/40 bg-green-500/10 text-green-400'
                )}
              >
                Success
              </Badge>
              <Badge variant="secondary">{deploy.environment}</Badge>
              <Badge variant="outline">{deploy.duration}</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono text-foreground">{deploy.commit}</span> — {deploy.message}
          </p>
          <p className="text-xs text-muted-foreground">{deploy.createdAt}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Find in logs (Ctrl+F)"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1 w-fit">
            <button
              onClick={() => setTab('settings')}
              className={cn(
                'rounded px-3 py-1 text-sm transition-colors',
                tab === 'settings' ? 'bg-card shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Deployment Settings
            </button>
            <button
              onClick={() => setTab('logs')}
              className={cn(
                'rounded px-3 py-1 text-sm transition-colors',
                tab === 'logs' ? 'bg-card shadow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Deploy Logs
            </button>
          </div>
          {tab === 'logs' ? (
            <div className="overflow-hidden rounded-md border bg-[#0b1220]">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TerminalSquare className="h-3.5 w-3.5" />
                  deploy log
                </span>
                <span className="text-xs text-amber-400">
                  {deploy.warnings} warning lines · 2 Recommendations
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
                {lines.map((line, i) => (
                  <div key={i} className="flex gap-3 py-0.5">
                    <span className="shrink-0 text-muted-foreground/50">{line.time ?? '13:53'}</span>
                    <span
                      className={cn(
                        'whitespace-pre-wrap break-all',
                        line.level === 'warn' && 'text-amber-400',
                        line.level === 'error' && 'text-red-400',
                        line.level === 'info' && 'text-slate-300'
                      )}
                    >
                      {line.level === 'warn' ? '⚠ ' : ''}
                      {line.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Image
                src="/deploy-errors/deploy-log.png"
                alt="Vercel deployment settings"
                width={1200}
                height={600}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
