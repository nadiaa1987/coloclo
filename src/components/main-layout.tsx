"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { LayoutDashboard, Wand2, LifeBuoy, Mail, LogOut, Loader2, History } from 'lucide-react';
import { Header } from './header';

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
    // If finished loading, no user, and not on a public page, redirect to login
    if (!loading && !user && !['/', '/login', '/signup', '/contact', '/legal'].includes(pathname)) {
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
      router.push('/');
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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we have a user, show the main dashboard layout with sidebar
  if (user) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center justify-center p-2">
                <Image
                    src="https://raw.githubusercontent.com/nadiaa1987/coloclo/main/logo.png"
                    alt="Coco Wyo Logo"
                    width={150}
                    height={60}
                    className="object-contain transition-all duration-200 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10"
                />
            </Link>
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
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm md:hidden">
                <div className="container flex h-14 items-center">
                    <SidebarTrigger className="mr-2" />
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="https://raw.githubusercontent.com/nadiaa1987/coloclo/main/logo.png"
                            alt="Coco Wyo Logo"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                </div>
            </header>
            {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If no user and not loading, show a simple layout for public pages
  if (!user && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // Fallback
  return null;
}
