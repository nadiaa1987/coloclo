"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookHeart, LayoutDashboard, Wand2, LifeBuoy, Mail, LogOut, Loader2, History } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Generator', icon: Wand2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/legal', label: 'Legal', icon: LifeBuoy },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    // If finished loading and no user, redirect to login, unless on an auth page
    if (!loading && !user && !['/login', '/signup'].includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  // On auth pages, just render children without the layout
  if (['/login', '/signup'].includes(pathname)) {
    return <>{children}</>;
  }

  // While loading auth state, show a full-screen loader
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we have a user, show the main dashboard layout
  if (user) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" asChild>
                <SidebarTrigger />
              </Button>
              <BookHeart className="h-7 w-7 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">ColoringKit</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3 rounded-md bg-muted p-2">
               <Avatar>
                 <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div className="flex-1 overflow-hidden">
                 <p className="truncate text-sm font-medium">{user.email}</p>
                 <p className="truncate text-xs text-muted-foreground">Pro Plan</p>
               </div>
               <Button variant="ghost" size="icon" onClick={handleLogout}>
                 <LogOut />
               </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-14 items-center">
                    <SidebarTrigger className="mr-2" />
                    {/* Header content can go here if needed */}
                </div>
            </header>
            {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Fallback for when user is null but not loading (e.g. initial render)
  return null;
}
