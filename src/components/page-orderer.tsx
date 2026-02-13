"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Book, Download, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

type TitlePageSettings = {
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  x: number;
  y: number;
};

export function PageOrderer({ initialImages, onBack, bookTopic, kdpSettings }: PageOrdererProps) {
  const [pages, setPages] = useState<ImageResult[]>(initialImages);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [addBlankPages, setAddBlankPages] = useState(false);
  const { toast } = useToast();
  
  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const titlePageContainerRef = useRef<HTMLDivElement>(null);

  const [titlePageSettings, setTitlePageSettings] = useState<TitlePageSettings>({
    text: "THIS BOOK BELONGS TO",
    fontSize: 22,
    fontFamily: "helvetica",
    textAlign: "center",
    x: 50,
    y: 50,
  });

  const [editingTitlePageSettings, setEditingTitlePageSettings] = useState<TitlePageSettings>(titlePageSettings);

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

  const handleTitleDragStart = (e: React.PointerEvent<HTMLParagraphElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingTitle(true);
  };

  const handleTitleDragMove = (e: PointerEvent) => {
    if (!isDraggingTitle || !titlePageContainerRef.current) return;
    e.preventDefault();

    const rect = titlePageContainerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));

    setTitlePageSettings(prev => ({ ...prev, x: clampedX, y: clampedY }));
  };

  const handleTitleDragEnd = () => {
    setIsDraggingTitle(false);
  };

  useEffect(() => {
    if (isDraggingTitle) {
      window.addEventListener('pointermove', handleTitleDragMove);
      window.addEventListener('pointerup', handleTitleDragEnd);
    } else {
      window.removeEventListener('pointermove', handleTitleDragMove);
      window.removeEventListener('pointerup', handleTitleDragEnd);
    }

    return () => {
      window.removeEventListener('pointermove', handleTitleDragMove);
      window.removeEventListener('pointerup', handleTitleDragEnd);
    };
  }, [isDraggingTitle]);


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

      // Page 1: "This book belongs to"
      const { text, fontSize, fontFamily, textAlign, x: textX, y: textY } = titlePageSettings;
      const margin = 0.5;

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(fontSize);
      
      const xPos = pageWidth * (textX / 100);
      const yPos = pageHeight * (textY / 100);

      doc.text(text, xPos, yPos, { align: textAlign, baseline: 'middle' });


      for (let i = 0; i < pages.length; i++) {
        // Add a page for the coloring image itself
        doc.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
        
        const page = pages[i];
        const imgData = page.imageUrl;
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = pageHeight - margin * 2;
        const x = margin;
        const y = margin;
        
        doc.addImage(imgData, 'PNG', x, y, imageWidth, imageHeight);
        
        // Add a blank page after the coloring page if requested
        if (addBlankPages) {
          doc.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
        }
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
            Drag and drop the pages to set the order for your book: "{bookTopic}". Click the first page to edit it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Dialog onOpenChange={(isOpen) => {
              if (isOpen) {
                setEditingTitlePageSettings(titlePageSettings);
              }
            }}>
              <DialogTrigger asChild>
                <div
                    className={cn(
                        "rounded-lg border bg-card p-2 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    )}
                >
                    <div className="flex justify-between items-center mb-2 w-full">
                        <span className="font-bold text-lg">1</span>
                    </div>
                    <div ref={titlePageContainerRef} className="aspect-square relative w-full bg-muted/50 rounded-md overflow-hidden">
                        <p 
                          onPointerDown={handleTitleDragStart}
                          className="font-semibold text-muted-foreground break-words absolute cursor-move select-none"
                          style={{
                            fontSize: `${Math.min(titlePageSettings.fontSize, 32)}px`,
                            left: `${titlePageSettings.x}%`,
                            top: `${titlePageSettings.y}%`,
                            transform: `translate(-${titlePageSettings.textAlign === 'center' ? 50 : titlePageSettings.textAlign === 'right' ? 100 : 0}%, -50%)`,
                            textAlign: titlePageSettings.textAlign,
                            lineHeight: 1.2
                          }}
                        >
                          {titlePageSettings.text}
                        </p>
                    </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Title Page</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="text" className="text-right">
                      Text
                    </Label>
                    <Input
                      id="text"
                      value={editingTitlePageSettings.text}
                      onChange={(e) => setEditingTitlePageSettings({ ...editingTitlePageSettings, text: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fontSize" className="text-right">
                      Font Size
                    </Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={editingTitlePageSettings.fontSize}
                      onChange={(e) => setEditingTitlePageSettings({ ...editingTitlePageSettings, fontSize: Number(e.target.value) })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fontFamily" className="text-right">
                      Font
                    </Label>
                    <Select
                        value={editingTitlePageSettings.fontFamily}
                        onValueChange={(value) => setEditingTitlePageSettings({ ...editingTitlePageSettings, fontFamily: value })}
                      >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helvetica">Helvetica</SelectItem>
                        <SelectItem value="times">Times New Roman</SelectItem>
                        <SelectItem value="courier">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Alignment</Label>
                    <RadioGroup
                      value={editingTitlePageSettings.textAlign}
                      onValueChange={(value: string) => {
                          if (value) {
                             setEditingTitlePageSettings({ ...editingTitlePageSettings, textAlign: value as "left" | "center" | "right" })
                          }
                        }
                      }
      
                      className="col-span-3 flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="align-left" />
                        <Label htmlFor="align-left" className="font-normal">Left</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="center" id="align-center" />
                        <Label htmlFor="align-center" className="font-normal">Center</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="align-right" />
                        <Label htmlFor="align-right" className="font-normal">Right</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={() => setTitlePageSettings(editingTitlePageSettings)}>
                      Save changes
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <span className="font-bold text-lg">{index + 2}</span>
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
          <div className="flex items-center justify-end space-x-2 mt-8">
            <Switch id="blank-pages" checked={addBlankPages} onCheckedChange={setAddBlankPages} />
            <Label htmlFor="blank-pages" className="font-normal">Add blank page after each coloring page</Label>
          </div>
          <div className="mt-2 flex justify-end gap-2">
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
