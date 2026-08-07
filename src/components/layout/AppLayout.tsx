'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden', 'lg:pl-64')}>
        <React.Suspense fallback={null}>
          <Topbar />
        </React.Suspense>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}