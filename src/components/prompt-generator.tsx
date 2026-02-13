"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookText, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generatePromptsAction } from "@/app/actions";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  count: z.coerce.number().int().min(1, "You must generate at least 1 page.").max(20, "You can generate a maximum of 20 pages at a time."),
  size: z.string(),
  style: z.string(),
});

type PromptGeneratorProps = {
  onPromptsGenerated: (prompts: string[], topic: string) => void;
};

export function PromptGenerator({ onPromptsGenerated }: PromptGeneratorProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "Cute Animals",
      count: 5,
      size: "8.5x11",
      style: "Coco Wyo",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await generatePromptsAction({
      topic: values.topic,
      count: values.count,
      style: values.style,
    });

    if (result.success && result.prompts) {
      toast({
        title: "Prompts Generated!",
        description: `Successfully generated ${result.prompts.length} prompts. Now generating images.`,
      });
      onPromptsGenerated(result.prompts, values.topic);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error || "Could not generate prompts.",
      });
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center gap-2 mx-auto">
          <BookText className="h-8 w-8 text-primary" />
          <CardTitle className="text-4xl font-headline tracking-tighter">Generate Coloring Book Prompts</CardTitle>
        </div>
        <CardDescription className="pt-2">
          Start by telling us your book's topic. We'll generate creative prompts for your coloring pages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Magical Creatures, Space Adventure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artistic Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>🎀 Cute / Soft Styles</SelectLabel>
                        <SelectItem value="Coco Wyo">Coco Wyo</SelectItem>
                        <SelectItem value="Kawaii Style">Kawaii Style</SelectItem>
                        <SelectItem value="Chibi Style">Chibi Style</SelectItem>
                        <SelectItem value="Super Cute Cartoon">Super Cute Cartoon</SelectItem>
                        <SelectItem value="Pastel Goth">Pastel Goth</SelectItem>
                        <SelectItem value="Cozy Cute Style">Cozy Cute Style</SelectItem>
                        <SelectItem value="Bubble Style">Bubble Style</SelectItem>
                        <SelectItem value="Whimsical Cute">Whimsical Cute</SelectItem>
                        <SelectItem value="Soft Line Art">Soft Line Art</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>📺 Cartoon Styles</SelectLabel>
                        <SelectItem value="Classic Cartoon Style">Classic Cartoon Style</SelectItem>
                        <SelectItem value="Retro 90s Cartoon">Retro 90s Cartoon</SelectItem>
                        <SelectItem value="Saturday Morning Cartoon">Saturday Morning Cartoon</SelectItem>
                        <SelectItem value="Comic Book Style">Comic Book Style</SelectItem>
                        <SelectItem value="Western Animation Style">Western Animation Style</SelectItem>
                        <SelectItem value="Funny Caricature Style">Funny Caricature Style</SelectItem>
                        <SelectItem value="Bold Outline Cartoon">Bold Outline Cartoon</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🌸 Anime / Manga Inspired Styles</SelectLabel>
                        <SelectItem value="Anime Style">Anime Style</SelectItem>
                        <SelectItem value="Manga Line Art">Manga Line Art</SelectItem>
                        <SelectItem value="Shojo Style (cute girls, flowers)">Shojo Style (cute girls, flowers)</SelectItem>
                        <SelectItem value="Shonen Action Style">Shonen Action Style</SelectItem>
                        <SelectItem value="Magical Girl Style">Magical Girl Style</SelectItem>
                        <SelectItem value="Fantasy Anime Style">Fantasy Anime Style</SelectItem>
                        <SelectItem value="Gothic Anime Style">Gothic Anime Style</SelectItem>
                        <SelectItem value="Cyberpunk Anime Style">Cyberpunk Anime Style</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🌀 Pattern / Mandala Styles</SelectLabel>
                        <SelectItem value="Traditional Mandala">Traditional Mandala</SelectItem>
                        <SelectItem value="Floral Mandala">Floral Mandala</SelectItem>
                        <SelectItem value="Animal Mandala">Animal Mandala</SelectItem>
                        <SelectItem value="Geometric Mandala">Geometric Mandala</SelectItem>
                        <SelectItem value="Zentangle Style">Zentangle Style</SelectItem>
                        <SelectItem value="Boho Mandala">Boho Mandala</SelectItem>
                        <SelectItem value="Sacred Geometry">Sacred Geometry</SelectItem>
                        <SelectItem value="Islamic Pattern Style">Islamic Pattern Style</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🖋️ Line Art Variations</SelectLabel>
                        <SelectItem value="Bold & Easy Line Art (kids)">Bold & Easy Line Art (kids)</SelectItem>
                        <SelectItem value="Thick Outline Style">Thick Outline Style</SelectItem>
                        <SelectItem value="Thin Detailed Line Art">Thin Detailed Line Art</SelectItem>
                        <SelectItem value="Minimalist Line Art">Minimalist Line Art</SelectItem>
                        <SelectItem value="Continuous Line Art">Continuous Line Art</SelectItem>
                        <SelectItem value="Hand-Drawn Sketch Style">Hand-Drawn Sketch Style</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🌈 Aesthetic / Trend Styles</SelectLabel>
                        <SelectItem value="Cottagecore Style">Cottagecore Style</SelectItem>
                        <SelectItem value="Dark Academia">Dark Academia</SelectItem>
                        <SelectItem value="Vaporwave Style">Vaporwave Style</SelectItem>
                        <SelectItem value="Y2K Style">Y2K Style</SelectItem>
                        <SelectItem value="Grunge Style">Grunge Style</SelectItem>
                        <SelectItem value="Minimal Aesthetic">Minimal Aesthetic</SelectItem>
                        <SelectItem value="Dreamy Fantasy Style">Dreamy Fantasy Style</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🏰 Fantasy / Special Art Styles</SelectLabel>
                        <SelectItem value="Fairytale Illustration Style">Fairytale Illustration Style</SelectItem>
                        <SelectItem value="Storybook Style">Storybook Style</SelectItem>
                        <SelectItem value="Medieval Illustration">Medieval Illustration</SelectItem>
                        <SelectItem value="Gothic Illustration">Gothic Illustration</SelectItem>
                        <SelectItem value="Steampunk Style">Steampunk Style</SelectItem>
                        <SelectItem value="Mythology Art Style">Mythology Art Style</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>🎨 Experimental Styles</SelectLabel>
                        <SelectItem value="Abstract Line Art">Abstract Line Art</SelectItem>
                        <SelectItem value="Doodle Art">Doodle Art</SelectItem>
                        <SelectItem value="Pop Art Style">Pop Art Style</SelectItem>
                        <SelectItem value="Graffiti Style">Graffiti Style</SelectItem>
                        <SelectItem value="Psychedelic Pattern Style">Psychedelic Pattern Style</SelectItem>
                        <SelectItem value="Surreal Illustration Style">Surreal Illustration Style</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Pages</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KDP Page Size (inches)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="8.5x11">8.5 x 11</SelectItem>
                        <SelectItem value="6x9">6 x 9</SelectItem>
                        <SelectItem value="8.25x8.25">8.25 x 8.25</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Generating Prompts...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Next: Generate Images
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
