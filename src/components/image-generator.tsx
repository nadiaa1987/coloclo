"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Wand2, Download, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { generateImageAction } from "@/app/actions";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
});

export function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "A friendly dragon",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setImageUrl(null);
    try {
      const result = await generateImageAction({ prompt: values.prompt });
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        toast({
          variant: "destructive",
          title: "Image generation failed",
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
      setIsLoading(false);
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${form.getValues('prompt').replace(/\s/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mx-auto">
             <Wand2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-4xl font-headline tracking-tighter">AI Image Generator</CardTitle>
          </div>
          <CardDescription className="pt-2">
            Turn your text prompts into images with AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Prompt</FormLabel>
                    <FormControl>
                      <Input
                        className="text-base"
                        placeholder="e.g., A cute cat wearing a wizard hat"
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
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Image
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            <div className="aspect-square relative w-full bg-muted/50 rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center text-muted-foreground">
              {isLoading && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                  <p className="font-medium">Your vision is being generated...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment.</p>
                </div>
              )}
              {!isLoading && !imageUrl && (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className="h-12 w-12" />
                  <p className="font-medium">Your generated image will appear here</p>
                </div>
              )}
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={form.getValues('prompt')}
                  fill
                  className="object-contain"
                  data-ai-hint="generated image"
                  unoptimized
                />
              )}
            </div>
            {imageUrl && !isLoading && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleDownload} variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
