"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Book, Download, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type ImageResult = {
  id: string;
  imageUrl: string;
  prompt: string;
};

type PageOrdererProps = {
  initialImages: ImageResult[];
  onBack: () => void;
  bookTopic?: string;
  kdpSettings: {
    size: string;
    bleed: string;
  };
};

export function PageOrderer({ initialImages, onBack, bookTopic, kdpSettings }: PageOrdererProps) {
  const [pages, setPages] = useState<ImageResult[]>(initialImages);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItem(id);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    if (draggingItem === null) return;
    if (draggingItem === dropId) {
      setDraggingItem(null);
      return;
    }

    const draggingIndex = pages.findIndex(p => p.id === draggingItem);
    const dropIndex = pages.findIndex(p => p.id === dropId);

    if (draggingIndex === -1 || dropIndex === -1) return;

    const newPages = [...pages];
    const [draggedItem] = newPages.splice(draggingIndex, 1);
    newPages.splice(dropIndex, 0, draggedItem);
    setPages(newPages);
    setDraggingItem(null);
  };
  
  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    toast({ title: "Preparing PDF...", description: "Your coloring book is being generated." });

    try {
      const dimensions: { [key: string]: { width: number; height: number } } = {
        '8.5x11': { width: 8.5, height: 11 },
        '6x9': { width: 6, height: 9 },
        '8.25x8.25': { width: 8.25, height: 8.25 },
      };

      const { size, bleed } = kdpSettings;
      let pageWidth = dimensions[size]?.width || 8.5;
      let pageHeight = dimensions[size]?.height || 11;

      if (bleed === 'bleed') {
        pageWidth += 0.125;
        pageHeight += 0.25;
      }

      const doc = new jsPDF({
        orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
        unit: 'in',
        format: [pageWidth, pageHeight],
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const imgData = page.imageUrl;
        const margin = 0.5;
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = pageHeight - margin * 2;
        const x = margin;
        const y = margin;

        if (i > 0) {
          doc.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
        }
        
        doc.addImage(imgData, 'PNG', x, y, imageWidth, imageHeight);
      }
      
      doc.save(`${bookTopic?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'coloring_book'}.pdf`);
      toast({ title: "Download started!", description: "Your PDF book is being downloaded." });
    } catch(error) {
      console.error(error);
      toast({ variant: "destructive", title: "Uh oh! Something went wrong.", description: "Could not generate the PDF." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Image Generation
      </Button>
      <Card className="max-w-6xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline tracking-tighter">Arrange Your Coloring Book</CardTitle>
          <CardDescription className="pt-2">
            Drag and drop the pages to set the order for your book: "{bookTopic}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, page.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "rounded-lg border bg-card p-2 shadow-sm transition-all cursor-grab active:cursor-grabbing flex flex-col",
                  draggingItem === page.id && "opacity-50 scale-105"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{index + 1}</span>
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="aspect-square relative w-full bg-muted/50 rounded-md overflow-hidden">
                    <Image
                        src={page.imageUrl}
                        alt={page.prompt}
                        fill
                        className="object-contain"
                        data-ai-hint="generated coloring page"
                        unoptimized
                    />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-2">
            <Button size="lg" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              Download PDF
            </Button>
            <Button size="lg" disabled>
              <Book className="mr-2 h-5 w-5" />
              Download EPUB (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
