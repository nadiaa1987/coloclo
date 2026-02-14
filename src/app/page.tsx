"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusSquare, History, HelpCircle, Activity, Paintbrush, BookOpen, Download, Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import React from "react";

function LandingPage() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="bg-background text-foreground">
          <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-32 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
                Your ultimate<br />
                <span className="text-primary">all-in-one</span><br />
                platform for Amazon KDP<br />
                <span className="text-accent">Success</span>
              </h1>
              <p className="mt-6 text-lg max-w-xl mx-auto md:mx-0 text-muted-foreground">
                Effortlessly create professional-grade puzzle books, coloring books, story books, journals, and niche planners designed to rank and sell. Go from idea to print-ready PDF for Amazon KDP in minutes, not weeks.
              </p>
              <div className="mt-10 flex items-center justify-center md:justify-start gap-x-4">
                <Button asChild size="lg" className="font-semibold px-8 py-6 text-base">
                  <Link href="/signup">Start Creating for Free</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center items-center">
                <div className="aspect-square w-full overflow-hidden rounded-lg shadow-2xl">
                    <Image
                      src="https://github.com/nadiaa1987/coloclo/blob/main/headerimage.png?raw=true"
                      alt="A collage of cute and cozy coloring book covers"
                      width={1024}
                      height={1024}
                      className="object-contain w-full h-full"
                      data-ai-hint="coloring book covers"
                    />
                </div>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Create</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From prompt ideas to PDF export, we've got you covered.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Paintbrush className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">AI Image Generation</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Use our powerful AI to generate high-quality, clean line art from text prompts in various styles.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Book Arrangement</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Easily drag and drop your generated pages to create the perfect coloring book sequence.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">KDP-Ready PDF Export</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Download your book as a PDF, with options for bleed and popular KDP trim sizes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-muted py-20 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that's right for you.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <Card className="flex flex-col border-primary shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Pro Monthly</CardTitle>
                    <div className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5">Most Popular</div>
                  </div>
                  <CardDescription>For the serious creator</CardDescription>
                  <p className="text-4xl font-bold pt-4">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />Unlimited book generations</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />50 pages per book</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />All image styles</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />Save to history</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/signup">Sign Up Now</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Pro Yearly</CardTitle>
                  <CardDescription>Save big with an annual plan</CardDescription>
                  <p className="text-4xl font-bold pt-4">$299<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />Unlimited book generations</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />50 pages per book</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />All image styles</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" />Save to history</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/signup">Choose Yearly</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI Coloring Book Generator. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-x-6">
            <Link href="/legal" className="text-sm hover:underline">Legal</Link>
            <Link href="/contact" className="text-sm hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

const quickActions = [
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

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

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

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return user ? <DashboardPage /> : <LandingPage />;
}
