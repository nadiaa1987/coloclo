"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusSquare, Star, History, HelpCircle, Activity, Box, Calendar, Paintbrush } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

const quickActions: QuickAction[] = [
  {
    title: 'AI Generator',
    description: 'Create new masterpieces',
    href: '/create',
    icon: Paintbrush,
  },
  {
    title: 'View History',
    description: 'Browse your gallery',
    href: '/history',
    icon: History,
  },
  {
    title: 'Support Center',
    description: 'Help & documentation',
    href: '/contact',
    icon: HelpCircle,
  },
];

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
}

const StatCard = ({ title, value, description, icon: Icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [totalGenerations, setTotalGenerations] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.push('/login');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalGenerations(docSnap.data().totalGenerations ?? 0);
      } else {
        setTotalGenerations(0);
      }
    });

    return () => unsubscribe();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Welcome back, {user.email}!</CardTitle>
            <CardDescription className="mt-2">
              Create amazing images with our state-of-the-art AI technology. All your tools are ready for your next masterpiece.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/create">
              <PlusSquare className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total Generations" value={totalGenerations !== null ? String(totalGenerations) : '...'} icon={Box} />
        <StatCard title="Images Today" value="0/∞" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link href={action.href} key={action.title} className="group">
                <Card className="h-full hover:border-primary transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <action.icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center">
              <Activity className="h-5 w-5 mr-4 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Welcome to the App!</p>
                <p className="text-sm text-muted-foreground">Just now</p>
              </div>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-4 text-yellow-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Account initialized</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
