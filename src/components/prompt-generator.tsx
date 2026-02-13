"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookText, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generatePromptsAction } from "@/app/actions";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  count: z.coerce.number().int().min(1, "You must generate at least 1 page.").max(20, "You can generate a maximum of 20 pages at a time."),
  size: z.string(),
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
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await generatePromptsAction({
      topic: values.topic,
      count: values.count,
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
