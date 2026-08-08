'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandDialog } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bell, Shield, Settings, User, LogOut, Plus, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const recentProjects = [
  { name: 'Production API', href: '/monitors', icon: Zap },
  { name: 'Marketing Website', href: '/status', icon: Shield },
  { name: 'Internal Tools', href: '/settings', icon: Settings },
];

const notifications = [
  { id: '1', title: 'Payment Gateway Down', description: 'Monitor "Payment Gateway" is down', time: '5 min ago', read: false, type: 'down' },
  { id: '2', title: 'API Latency Degraded', description: 'API Health Check latency increased to 500ms', time: '1 hour ago', read: false, type: 'degraded' },
  { id: '3', title: 'Homepage Recovered', description: 'Homepage is now responding normally', time: '2 hours ago', read: true, type: 'recovery' },
  { id: '4', title: 'SSL Expiring Soon', description: 'SSL certificate for api.example.com expires in 14 days', time: '1 day ago', read: true, type: 'ssl_expiring' },
];

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Link
            href="/"
            className="flex items-center gap-2 hidden lg:flex"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">DeployPulse</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-2">
            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
              <CommandInput placeholder="Search monitors, incidents..." className="h-10 bg-background" />
              <CommandList>
                <CommandGroup>
                  <CommandItem>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search...</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Monitors">
                  {recentProjects.map((project) => (
                    <CommandItem key={project.name} onSelect={() => setSearchOpen(false)}>
                      <project.icon className="mr-2 h-4 w-4" />
                      {project.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{unreadCount} unread</Badge>
                )}
              </div>
              <ScrollArea className="h-96">
                <div className="p-2 space-y-1">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        'p-3 hover:bg-accent',
                        !notification.read && 'bg-accent/50'
                      )}
                      onSelect={() => setNotificationsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 h-2 w-2 rounded-full flex-shrink-0',
                            notification.type === 'down' && 'bg-destructive',
                            notification.type === 'degraded' && 'bg-warning',
                            notification.type === 'recovery' && 'bg-success',
                            notification.type === 'ssl_expiring' && 'bg-info'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', !notification.read && 'font-bold')}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="px-4 py-2 text-center text-sm"
                onSelect={() => setNotificationsOpen(false)}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" onClick={() => setUserMenuOpen(false)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" onClick={() => setUserMenuOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
