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
  style: z.string().describe('The artistic style for the coloring book pages.'),
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

const generatePromptsFlow = ai.defineFlow(
  {
    name: 'generatePromptsFlow',
    inputSchema: GeneratePromptsInputSchema,
    outputSchema: GeneratePromptsOutputSchema,
  },
  async (input) => {
    const textGenerationPrompt = `You are an expert at creating engaging prompts for coloring book pages.
Generate ${input.count} unique and descriptive prompts based on the topic: '${input.topic}'.
Each prompt should be in the style of '${input.style}'.
Each prompt should describe a scene that would make a great black and white coloring page for kids or adults.
Focus on clear, simple, and imaginative scenes. Avoid overly complex or abstract ideas.
The output should be only the list of prompts, each on a new line.`;
    
    const encodedPrompt = encodeURIComponent(textGenerationPrompt);
    const url = `https://gen.pollinations.ai/text/${encodedPrompt}?model=gemini-fast&key=sk_UOsZKtGMSYNskyHUmwbWTQEdYPKv2UxR`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts from Pollinations AI: ${response.statusText}`);
    }

    const responseText = await response.text();
    let promptsList: string[] = [];

    try {
      // Pollinations.ai can return a JSON object with an 'output' field
      const data = JSON.parse(responseText);
      if (data && data.output && typeof data.output === 'string') {
        promptsList = data.output.split('\n');
      } else {
        // Or it might be a plain string in the response
        promptsList = responseText.split('\n');
      }
    } catch (error) {
      // If parsing fails, assume it's a plain text response with newlines
      promptsList = responseText.split('\n');
    }
    
    const prompts = promptsList
      .map(p => p.trim())
      .filter(p => p.length > 0)
      // Remove any list numbering like "1. " or "- "
      .map(p => p.replace(/^\s*(\d+\.|-)\s*/, ''));

    return { prompts };
  }
);
