'use server';
/**
 * @fileOverview A Genkit flow that generates text prompts for coloring book pages.
 *
 * - generatePrompts - A function that handles the prompt generation process.
 * - GeneratePromptsInput - The input type for the generatePrompts function.
 * - GeneratePromptsOutput - The return type for the generatePrompts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema
const GeneratePromptsInputSchema = z.object({
  topic: z.string().describe('The central theme or topic for the coloring book pages.'),
  count: z.number().int().min(1).max(50).describe('The number of prompts to generate.'),
});
export type GeneratePromptsInput = z.infer<typeof GeneratePromptsInputSchema>;

// Output schema
const GeneratePromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of generated text prompts.'),
});
export type GeneratePromptsOutput = z.infer<typeof GeneratePromptsOutputSchema>;


export async function generatePrompts(
  input: GeneratePromptsInput
): Promise<GeneratePromptsOutput> {
  return generatePromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColoringPrompts',
  input: { schema: GeneratePromptsInputSchema },
  output: { schema: GeneratePromptsOutputSchema },
  prompt: `You are an expert at creating engaging prompts for coloring book pages.
Generate {{count}} unique and descriptive prompts based on the topic: '{{topic}}'.
Each prompt should describe a scene that would make a great black and white coloring page for kids or adults.
Focus on clear, simple, and imaginative scenes. Avoid overly complex or abstract ideas.`,
});


const generatePromptsFlow = ai.defineFlow(
  {
    name: 'generatePromptsFlow',
    inputSchema: GeneratePromptsInputSchema,
    outputSchema: GeneratePromptsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
