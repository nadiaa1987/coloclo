'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import jsPDF from "jspdf";
import { useToast } from '@/hooks/use-toast';

// Define types locally for the page
type Book = {
  id: string;
  name: string;
  topic: string;
  kdpSettings: any;
  titlePageSettings: any;
  createdAt: any;
};
type Page = {
  id: string;
  imageUrl: string;
  prompt: string;
  order: number;
};

export default function BookHistoryPage() {
  const { bookId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (user && bookId) {
      const fetchBook = async () => {
        setLoading(true);
        try {
          const bookRef = doc(db, `users/${user.uid}/books`, bookId as string);
          const bookSnap = await getDoc(bookRef);

          if (bookSnap.exists()) {
            setBook({ id: bookSnap.id, ...bookSnap.data() } as Book);

            const pagesQuery = query(collection(bookRef, 'pages'), orderBy('order'));
            const pagesSnap = await getDocs(pagesQuery);
            const pagesData = pagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
            setPages(pagesData);
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching book:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, bookId, authLoading]);

  const handleDownloadPdf = async () => {
    if (!book) return;
    
    setIsDownloading(true);
    toast({ title: "Preparing PDF...", description: "Your coloring book is being generated." });

    try {
        const getAsDataURI = (url: string): Promise<string> => {
            // This needs to be handled by a proxy or server-side fetch if CORS is an issue.
            // For Firebase Storage, ensure CORS is configured to allow the origin.
            return fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                });
        };

      const { kdpSettings, titlePageSettings } = book;
      const dimensions: { [key: string]: { width: number; height: number } } = {
        '8.5x11': { width: 8.5, height: 11 },
        '6x9': { width: 6, height: 9 },
        '8.25x8.25': { width: 8.25, height: 8.25 },
      };

      let pageWidth = dimensions[kdpSettings.size]?.width || 8.5;
      let pageHeight = dimensions[kdpSettings.size]?.height || 11;
      if (kdpSettings.bleed === 'bleed') {
        pageWidth += 0.125;
        pageHeight += 0.25;
      }

      const doc = new jsPDF({
        orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
        unit: 'in',
        format: [pageWidth, pageHeight],
      });

      // Title Page
      if (titlePageSettings) {
        const { text, fontSize, fontFamily, textAlign, x: textX, y: textY } = titlePageSettings;
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(fontSize);
        const xPos = pageWidth * (textX / 100);
        const yPos = pageHeight * (textY / 100);
        doc.text(text, xPos, yPos, { align: textAlign, baseline: 'middle' });
      }


      // For now, no blank pages on download from history
      for (let i = 0; i < pages.length; i++) {
        doc.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
        const page = pages[i];
        
        // This can fail due to CORS if not configured on Firebase Storage bucket
        const imgData = await getAsDataURI(page.imageUrl);

        const margin = 0.5;
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = pageHeight - margin * 2;
        doc.addImage(imgData, 'PNG', margin, margin, imageWidth, imageHeight);
      }
      
      doc.save(`${book.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'coloring_book'}.pdf`);
      toast({ title: "Download started!" });
    } catch(error) {
      console.error(error);
      toast({ variant: "destructive", title: "Uh oh! Something went wrong.", description: "Could not generate the PDF. This may be a CORS issue with image fetching." });
    } finally {
      setIsDownloading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[calc(100vh-56px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!book) {
    return (
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Book not found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The book you are looking for does not exist or you do not have permission to view it.
        </p>
        <Button asChild className="mt-4">
            <Link href="/history">Back to History</Link>
        </Button>
      </main>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <Button asChild variant="ghost">
        <Link href="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
        </Link>
      </Button>
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{book.name}</h1>
            <p className="text-muted-foreground">Topic: {book.topic}</p>
        </div>
        <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map((page) => (
            <Card key={page.id}>
                <CardContent className="p-0">
                    <div className="aspect-square relative w-full bg-muted/50">
                        <Image
                            src={page.imageUrl}
                            alt={page.prompt}
                            fill
                            className="object-contain"
                            data-ai-hint="saved coloring page"
                        />
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
