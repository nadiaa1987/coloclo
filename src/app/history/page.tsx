'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Book = {
  id: string;
  name: string;
  topic: string;
  createdAt: {
    toDate: () => Date;
  };
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, `users/${user.uid}/books`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const booksData: Book[] = [];
        querySnapshot.forEach((doc) => {
          booksData.push({ id: doc.id, ...doc.data() } as Book);
        });
        setBooks(booksData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching history:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[calc(100vh-56px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You must be logged in to view your history.
        </p>
      </main>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
      </div>

      {books.length === 0 ? (
        <Card className="text-center py-12">
           <CardContent>
              <h2 className="text-2xl font-semibold">No books saved yet.</h2>
              <p className="mt-2 text-muted-foreground">Start creating to see your history here.</p>
              <Button asChild className="mt-4">
                <Link href="/create">Create a New Book</Link>
              </Button>
           </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{book.name}</span>
                </CardTitle>
                <CardDescription>Topic: {book.topic}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created on: {book.createdAt?.toDate().toLocaleDateString()}
                </p>
              </CardContent>
              {/* Maybe add a footer with actions later */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
