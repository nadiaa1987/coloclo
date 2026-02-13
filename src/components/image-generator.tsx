"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Wand2, Download, Image as ImageIcon, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateBulkImagesAction, regenerateImageAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const formSchema = z.object({
  prompts: z.string().min(1, "At least one prompt is required."),
});

type ImageResult = {
  id: string;
  imageUrl: string;
  prompt: string;
};

type ImageGeneratorProps = {
  initialPrompts?: string[];
  bookTopic?: string;
  onBack: () => void;
};

export function ImageGenerator({ initialPrompts, bookTopic, onBack }: ImageGeneratorProps) {
  const [imageResults, setImageResults] = useState<ImageResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompts: initialPrompts?.join("\n") ?? "A cute unicorn in a magical forest\nA happy robot waving",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setImageResults(null);
    const prompts = values.prompts.split('\n').map(p => p.trim()).filter(p => p.length > 0);

    if (prompts.length === 0) {
      toast({
        variant: "destructive",
        title: "No prompts provided",
        description: "Please enter at least one prompt, one per line.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const results = await generateBulkImagesAction({ prompts });
      
      const successfulResults = results
        .filter(r => r.success && r.imageUrl)
        .map((r, index) => ({ id: `${Date.now()}-${index}`, imageUrl: r.imageUrl!, prompt: r.prompt }));

      if(successfulResults.length > 0) {
        setImageResults(successfulResults);
      }

      const failedResults = results.filter(r => !r.success);
      if (failedResults.length > 0) {
        toast({
          variant: "destructive",
          title: `${failedResults.length} image(s) failed to generate`,
          description: `The following prompts failed: ${failedResults.map(r => `"${r.prompt}"`).join(', ')}`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not connect to the image generation service.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = (imageUrl: string, prompt: string) => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
      link.download = `coloring-page-${safePrompt}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePromptChange = (id: string, newPrompt: string) => {
    setImageResults(prevResults => 
      prevResults?.map(result => 
        result.id === id ? { ...result, prompt: newPrompt } : result
      ) ?? null
    );
  };

  const handleRegenerate = async (id: string, prompt: string) => {
    setRegeneratingIds(prev => [...prev, id]);
    try {
      const result = await regenerateImageAction({ prompt });
      if (result.success && result.imageUrl) {
        setImageResults(prevResults =>
          prevResults?.map(r => 
            r.id === id ? { ...r, imageUrl: result.imageUrl! } : r
          ) ?? null
        );
        toast({
          title: "Image Regenerated!",
          description: "The image has been updated with your new prompt.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to regenerate image",
          description: result.error || "An unknown error occurred.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not connect to the image generation service.",
      });
    } finally {
      setRegeneratingIds(prev => prev.filter(regenId => regenId !== id));
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Prompt Ideas
      </Button>
      <Card className="max-w-6xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mx-auto">
             <Wand2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-4xl font-headline tracking-tighter">AI Coloring Book Page Generator</CardTitle>
          </div>
          <CardDescription className="pt-2">
            {bookTopic
              ? `Here are the prompts for your book: "${bookTopic}". You can edit them before generating.`
              : "Turn your text prompts into coloring book pages for KDP. Enter one prompt per line."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Prompts</FormLabel>
                    <FormControl>
                      <Textarea
                        className="text-base min-h-[120px]"
                        placeholder="e.g., A cute cat wearing a wizard hat&#10;An astronaut dog on the moon"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Images
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            {isLoading && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="font-medium">Your visions are being illustrated...</p>
                <p className="text-sm text-muted-foreground">This may take a moment.</p>
              </div>
            )}
            {!isLoading && (!imageResults || imageResults.length === 0) && (
              <div className="aspect-video relative w-full bg-muted/50 rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className="h-12 w-12" />
                  <p className="font-medium">Your generated images will appear here</p>
                </div>
              </div>
            )}
            {imageResults && imageResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageResults.map((result) => {
                  const isRegenerating = regeneratingIds.includes(result.id);
                  return (
                    <Card key={result.id} className="overflow-hidden flex flex-col">
                      <CardContent className="p-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="aspect-square relative w-full bg-muted/50 cursor-pointer">
                              {isRegenerating && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                              )}
                              <Image
                                src={result.imageUrl}
                                alt={result.prompt}
                                fill
                                className="object-contain"
                                data-ai-hint="generated coloring page"
                                unoptimized
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl p-2">
                             <DialogTitle className="sr-only">{result.prompt}</DialogTitle>
                             <DialogDescription className="sr-only">An enlarged view of the generated image for the prompt: {result.prompt}</DialogDescription>
                             <div className="aspect-square relative w-full">
                                <Image
                                    src={result.imageUrl}
                                    alt={result.prompt}
                                    fill
                                    className="object-contain rounded-md"
                                    data-ai-hint="generated coloring page"
                                    unoptimized
                                />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                      <CardFooter className="flex-col items-start gap-2 p-4">
                        <Input
                          value={result.prompt}
                          onChange={(e) => handlePromptChange(result.id, e.target.value)}
                          className="w-full"
                          disabled={isRegenerating}
                        />
                        <div className="w-full grid grid-cols-2 gap-2">
                           <Button onClick={() => handleRegenerate(result.id, result.prompt)} variant="secondary" className="w-full" disabled={isRegenerating}>
                             {isRegenerating ? (
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                             ) : (
                               <RefreshCw className="mr-2 h-4 w-4" />
                             )}
                             Regenerate
                           </Button>
                           <Button onClick={() => handleDownload(result.imageUrl, result.prompt)} className="w-full">
                             <Download className="mr-2 h-4 w-4" />
                             Download
                           </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
